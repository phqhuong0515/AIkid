/**
 * Browser-side image gen for prototype HTML (art canvas).
 * Same contract as StoryMeeMobileApp:
 *   POST {GATEWAY}/internal/v1/media/upload  (ref drawing)
 *   POST {GATEWAY}/internal/v1/jobs           jobType=image
 *   GET  {GATEWAY}/internal/v1/jobs/:id      poll
 *
 * Auth: JWT from localStorage `storymee.access_token` (Expo SecureStore web fallback).
 * Workspace: `storymee.active_ip_id` or default seed.
 */
(function (global) {
  var DEFAULT_GATEWAY = 'https://dev-hub.storymee.com';
  var DEFAULT_IP = '11111111-1111-1111-1111-111111111111';
  var TOKEN_KEY = 'storymee.access_token';
  var IP_KEY = 'storymee.active_ip_id';

  function gatewayBase() {
    try {
      if (global.__AIKID_API_URL__) return String(global.__AIKID_API_URL__).replace(/\/$/, '');
      var fromLs =
        global.localStorage && global.localStorage.getItem('aikid.api_url');
      if (fromLs) return String(fromLs).replace(/\/$/, '');
    } catch (e) {}
    return DEFAULT_GATEWAY;
  }

  function getToken() {
    try {
      return global.localStorage && global.localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      return null;
    }
  }

  function getIpId() {
    try {
      return (
        (global.localStorage && global.localStorage.getItem(IP_KEY)) || DEFAULT_IP
      );
    } catch (e) {
      return DEFAULT_IP;
    }
  }

  function resolveMediaUri(raw) {
    if (!raw || typeof raw !== 'string') return null;
    var v = raw.trim();
    if (!v) return null;
    if (/^https?:\/\//i.test(v) || v.indexOf('data:') === 0) return v;
    if (v.indexOf('sb://') === 0) {
      var rest = v.slice(5);
      var slash = rest.indexOf('/');
      if (slash === -1) return null;
      var bucket = rest.slice(0, slash);
      var objectPath = rest.slice(slash + 1);
      return 'https://storage.storymee.com/' + bucket + '/' + objectPath;
    }
    // core-media-api upload returns Gateway-relative path:
    //   /internal/v1/media/public/uploads/<id>
    if (v.charAt(0) === '/') {
      return gatewayBase() + v;
    }
    // bare storage key
    if (v.indexOf('media/') === 0 || v.indexOf('content-media/') === 0) {
      return 'https://storage.storymee.com/' + v.replace(/^content-media\//, 'content-media/');
    }
    return v;
  }

  /** Walk response tree for any usable media URL field */
  function deepFindMediaUrl(obj, depth) {
    depth = depth || 0;
    if (depth > 8 || obj == null) return null;
    if (typeof obj === 'string') {
      var s = obj.trim();
      if (!s) return null;
      if (
        /^https?:\/\//i.test(s) ||
        s.indexOf('sb://') === 0 ||
        s.indexOf('/internal/v1/media/') === 0 ||
        s.indexOf('/media/public/') !== -1 ||
        s.indexOf('storage.storymee.com') !== -1
      ) {
        return s;
      }
      return null;
    }
    if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        var a = deepFindMediaUrl(obj[i], depth + 1);
        if (a) return a;
      }
      return null;
    }
    if (typeof obj === 'object') {
      // Prefer known keys first
      var prefer = [
        'imageUrl',
        'url',
        'driveUrl',
        'previewUrl',
        'publicUrl',
        'fileUrl',
        'src',
      ];
      for (var p = 0; p < prefer.length; p++) {
        if (typeof obj[prefer[p]] === 'string') {
          var hit = deepFindMediaUrl(obj[prefer[p]], depth + 1);
          if (hit) return hit;
        }
      }
      for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        var b = deepFindMediaUrl(obj[k], depth + 1);
        if (b) return b;
      }
    }
    return null;
  }

  function pickUploadPublicUrl(result) {
    if (!result) return null;
    // Accept full envelope { status, data } or unwrapped data
    var found = deepFindMediaUrl(result);
    if (!found) return null;
    var absolute = resolveMediaUri(found);
    if (!absolute) return null;
    // Jobs/workers need absolute fetchable URL
    if (absolute.charAt(0) === '/') {
      absolute = gatewayBase() + absolute;
    }
    return absolute;
  }

  function dataUrlToBlob(dataUrl) {
    var m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!m) throw new Error('Canvas không hợp lệ');
    var mime = m[1] || 'image/png';
    var bin = atob(m[2]);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  function unwrapData(payload) {
    if (payload && typeof payload === 'object' && payload.data !== undefined) {
      return payload.data;
    }
    return payload;
  }

  async function apiJson(method, path, body, isForm) {
    var token = getToken();
    if (!token) {
      throw new Error('Chưa đăng nhập — quay lại sảnh và đăng nhập phụ huynh.');
    }
    var headers = { Accept: 'application/json' };
    if (!isForm) headers['Content-Type'] = 'application/json';
    headers.Authorization = 'Bearer ' + token;

    var res = await fetch(gatewayBase() + path, {
      method: method,
      headers: headers,
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
    });

    var text = await res.text();
    var json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch (e) {
      json = { message: text };
    }

    if (!res.ok) {
      var msg =
        (json && (json.message || json.error)) ||
        'HTTP ' + res.status;
      if (res.status === 401) msg = 'Phiên đăng nhập hết hạn. Đăng nhập lại.';
      throw new Error(msg);
    }
    return json;
  }

  async function uploadDrawingDataUrl(dataUrl) {
    var blob = dataUrlToBlob(dataUrl);
    var fd = new FormData();
    fd.append('ipId', getIpId());
    fd.append('file', blob, 'aikid-drawing-' + Date.now() + '.png');

    var json = await apiJson('POST', '/internal/v1/media/upload', fd, true);
    // Try envelope + unwrapped + deep scan
    var url =
      pickUploadPublicUrl(json) ||
      pickUploadPublicUrl(unwrapData(json)) ||
      pickUploadPublicUrl(json && json.data);
    if (!url) {
      console.error('[AikidGatewayGen] upload response (no URL)', json);
      throw new Error(
        'Upload media OK nhưng không có URL công khai. Response: ' +
          JSON.stringify(json).slice(0, 280)
      );
    }
    return url;
  }

  function pickJobId(job) {
    if (!job) return null;
    return job.id || job.jobId || null;
  }

  function firstOutputUri(job) {
    if (!job) return null;
    var raw = job.outputUrls;
    var list = [];
    if (Array.isArray(raw)) list = raw.map(String);
    else if (typeof raw === 'string') {
      try {
        var p = JSON.parse(raw);
        if (Array.isArray(p)) list = p.map(String);
        else list = [raw];
      } catch (e) {
        list = [raw];
      }
    }
    if (!list.length) return null;
    return resolveMediaUri(list[0]);
  }

  async function createImageJob(prompt, referenceHttpsUrl, provider) {
    var inputParams = {
      prompt: String(prompt || '').trim(),
      provider: provider || 'google-native',
    };
    if (referenceHttpsUrl) {
      inputParams.reference_image_urls = [referenceHttpsUrl];
      inputParams.reference_image_url = referenceHttpsUrl;
      inputParams.image_url = referenceHttpsUrl;
    }

    var json = await apiJson('POST', '/internal/v1/jobs', {
      jobType: 'image',
      ipId: getIpId(),
      inputParams: inputParams,
    });
    var job = unwrapData(json) || json;
    var id = pickJobId(job);
    if (!id) throw new Error('Không nhận được Job ID từ server');
    return id;
  }

  async function pollJob(jobId, maxTicks, pollMs) {
    maxTicks = maxTicks || 72;
    pollMs = pollMs || 2500;
    var ok = { done: 1, success: 1, completed: 1 };
    var fail = { failed: 1, error: 1, cancelled: 1, canceled: 1 };

    for (var i = 0; i < maxTicks; i++) {
      var json = await apiJson('GET', '/internal/v1/jobs/' + encodeURIComponent(jobId));
      var job = unwrapData(json) || json;
      var st = String(job.status || '').toLowerCase();
      if (ok[st]) return job;
      if (fail[st]) throw new Error(job.errorMessage || 'Job thất bại: ' + st);
      await new Promise(function (r) {
        setTimeout(r, pollMs);
      });
    }
    throw new Error('Job quá lâu — thử lại sau');
  }

  function buildArtPrompt(styleName) {
    var style = (styleName || 'Màu Nước').trim();
    return (
      "Redraw this children's drawing as a polished illustration. " +
      'Art style: ' +
      style +
      '. Single centered subject, kid-friendly, clean composition, ' +
      'soft lighting, high quality, no text, no watermark, no multi-panel sheet.'
    );
  }

  /**
   * Full art redraw pipeline (MobileApp parity).
   * @returns {Promise<{url: string, jobId: string}>}
   */
  async function generateArtFromCanvas(dataUrl, styleName) {
    if (!dataUrl || dataUrl.indexOf('data:image') !== 0) {
      throw new Error('Chưa có nét vẽ trên canvas');
    }
    var refUrl = await uploadDrawingDataUrl(dataUrl);
    var prompt = buildArtPrompt(styleName);
    var jobId = await createImageJob(prompt, refUrl, 'google-native');
    var job = await pollJob(jobId);
    var url = firstOutputUri(job);
    if (!url) throw new Error('Job xong nhưng không có ảnh');
    return { url: url, jobId: jobId };
  }

  global.AikidGatewayGen = {
    generateArtFromCanvas: generateArtFromCanvas,
    uploadDrawingDataUrl: uploadDrawingDataUrl,
    createImageJob: createImageJob,
    pollJob: pollJob,
    getToken: getToken,
    getIpId: getIpId,
    gatewayBase: gatewayBase,
  };
})(typeof window !== 'undefined' ? window : globalThis);
