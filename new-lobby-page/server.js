const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables from .env file manually (pure Node.js)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const index = trimmed.indexOf('=');
            if (index > -1) {
                const key = trimmed.slice(0, index).trim();
                const value = trimmed.slice(index + 1).trim();
                // strip quotes if present
                const cleanValue = value.replace(/^['"]|['"]$/g, '');
                process.env[key] = cleanValue;
            }
        }
    });
}

const PORT = process.env.PORT || 8000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let urlPathname = req.url.split('?')[0];
    let decodedUrl = decodeURIComponent(urlPathname);

    // API endpoint for secure image generation
    if (req.method === 'POST' && decodedUrl === '/api/generate-image') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                let result;
                if (data.image) {
                    result = await redrawUserDrawing(data.image, data.style);
                } else if (data.prompt) {
                    result = await generateImageFromAPI(data.prompt, data.existingImage);
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Prompt or Image is required' }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (err) {
                console.error("AI Generation Error:", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
            }
        });
        return;
    }

    // Redirect /me, /mee, or /art to include trailing slash
    if (decodedUrl === '/me' || decodedUrl === '/mee' || decodedUrl === '/art') {
        res.writeHead(301, { 'Location': decodedUrl + '/' });
        res.end();
        return;
    }

    let filePath;
    let baseDir;

    if (decodedUrl.startsWith('/me/') || decodedUrl.startsWith('/mee/')) {
        let subPath = decodedUrl.startsWith('/me/') ? decodedUrl.slice(4) : decodedUrl.slice(5);
        if (subPath === '') {
            subPath = 'index.html';
        }
        baseDir = path.resolve(__dirname, '..', 'SVG');
        filePath = path.join(baseDir, subPath);
    } else if (decodedUrl.startsWith('/art/')) {
        let subPath = decodedUrl.slice(5);
        if (subPath === '') {
            subPath = 'index.html';
        }
        baseDir = path.resolve(__dirname, 'art');
        filePath = path.join(baseDir, subPath);
    } else {
        baseDir = __dirname;
        filePath = path.join(baseDir, decodedUrl === '/' ? 'index.html' : decodedUrl);
    }

    // Security check: ensure path is within the allowed directory
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(baseDir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Access Denied');
        return;
    }

    const extname = String(path.extname(resolvedPath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(resolvedPath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT' || error.code === 'EISDIR') {
                if (!extname) {
                    const cleanHtmlPath = resolvedPath + '.html';
                    fs.readFile(cleanHtmlPath, (cleanError, cleanContent) => {
                        if (!cleanError) {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(cleanContent);
                            return;
                        }
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end('<h1>404 Not Found</h1><p>Tệp tin không tồn tại.</p>');
                    });
                    return;
                }
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1><p>Tệp tin không tồn tại.</p>');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}\n`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Standing Lobby Server đang chạy thành công!`);
    console.log(`👉 Truy cập tại: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
});

// AI Image Generation Helpers (Google Imagen & OpenAI DALL-E)
const STYLE_PROMPT = `A single character, centered, centered in frame, strictly only one character, no duplicates, no multiple views, no sheet, no turnaround, no grid, no orthographic views. Stylized 3D character render, full-body character, isolated on a solid pure flat white background (#ffffff), no shadows on the background, no gradients on the background, no environment, no scene, no backdrop. High-quality cinematic cartoon 3D with soft rounded forms, smooth organic modeling, gentle bevels, clean stylized shading, refined matte materials, subtle soft fabric texture, soft ambient occlusion, elegant lighting, smooth gradients, and premium animated-feature quality. If the subject is human, skin should look soft, natural, refined, and more realistically textured, with delicate subsurface scattering, subtle visible pores, fine skin grain, delicate micro skin detail, gentle tonal variation, natural color breakup, soft blush transitions, faint undertone variation, soft natural unevenness, realistic skin breakup, natural peach-fuzz softness, slight translucency on thinner areas such as ears and nose, and a soft matte-satin finish. Add realistic but subtle skin surface detail so the face feels more lifelike, tactile, and believable, with visible natural skin grain, soft epidermal texture, faint warmth in the cheeks, nose, and ears, and premium stylized realism. Avoid overly smooth synthetic skin. The face should feel soft, believable, and premium, not toy-like or plastic. If the subject is a robot, replace skin realism with refined non-human surface realism: smooth but believable material breakup, subtle micro-surface detail, delicate wear variation, soft matte-to-satin finish, light edge variation, realistic panel definition, fine material texture, controlled reflections, and premium stylized mechanical design. The robot surface should feel tactile and believable, not like cheap toy plastic. If the subject is an animal or creature, replace human skin texture with soft natural surface detail appropriate to the character type, such as fine fur texture, soft feather layering, smooth stylized scales, or delicate creature skin texture. The surface should feel soft, believable, tactile, and naturally varied, with subtle micro-detail, gentle color variation, and premium stylized realism. Hair, fur, and feather details should be silky, smooth, airy, and naturally organic, with fine layered strands, natural strand separation, wispy edges, subtle flyaways, delicate tapering, soft volume, delicate micro-texture, gentle density variation, soft anisotropic highlights, and a low-gloss natural sheen. Hair, fur, or feathers must feel light, breathable, touchable, and naturally varied, never chunky, clumped, stiff, waxy, molded, rubbery, overly glossy, or plastic-like. Avoid solid sculpted masses and uniform synthetic surfaces. The overall material quality should feel warm, tactile, refined, and premium, with clean polished rendering, no line art, and no cheap toy-like plastic appearance.`;

const NEGATIVE_PROMPT = `multiple views, duplicate characters, character sheet, multiple poses, split screen, grid, turnaround, orthographic views, cut off characters on the sides, no room, no blurred backdrop, no shadowy environment, no gray background, no colored background, no dark background, no shadows on the background, no gradients on the background, no three-dimensional background elements. Avoid plastic skin, waxy face, glossy skin, toy-like plastic texture, overly smooth synthetic skin, hard specular highlights, rubbery texture, flat skin shading, lifeless skin, cheap toy plastic, low-detail materials, stiff hair, plastic-looking hair, plastic-looking fur, waxy hair, waxy fur, helmet hair, chunky clumps, rigid strand blocks, solid sculpted hair masses, overly uniform strand flow, glossy synthetic strands, matted fur, stiff feathers, harsh outlines, rough shading, noisy texture, flat mechanical shading, messy panel lines, unrealistic reflections, and any solid molded surface that looks plastic-like.`;

async function generateImageFromAPI(userPrompt, existingImage) {
    const aiProvider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
    
    // Merge prompt on server side to hide STYLE_PROMPT and prevent client side manipulation
    const finalPrompt = `${userPrompt}

STYLE REQUIREMENTS:
${STYLE_PROMPT}

AVOID:
${NEGATIVE_PROMPT}`;

    if (aiProvider === 'openai') {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey || apiKey.startsWith('your_')) {
            throw new Error('OpenAI API Key is not configured in .env');
        }
        return await callOpenAIEngine(finalPrompt, apiKey);
    } else {
        // default is gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey.startsWith('your_')) {
            throw new Error('Gemini API Key is not configured in .env');
        }
        return await callGeminiEngine(finalPrompt, apiKey, existingImage);
    }
}

async function callGeminiEngine(prompt, apiKey, existingImage) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`;
    const headers = {
        'Content-Type': 'application/json'
    };

    const parts = [];
    if (existingImage) {
        const match = existingImage.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
            const mimeType = match[1];
            const base64Bytes = match[2];
            parts.push({
                inlineData: {
                    mimeType: mimeType,
                    data: base64Bytes
                }
            });
        }
    }
    parts.push({ text: prompt });

    const body = JSON.stringify({
        contents: [
            {
                parts: parts
            }
        ],
        generationConfig: {
            responseModalities: ["IMAGE"]
        }
    });

    const resData = await makeHttpsPost(url, headers, body);
    if (resData.candidates && resData.candidates[0] && resData.candidates[0].content && resData.candidates[0].content.parts) {
        const parts = resData.candidates[0].content.parts;
        const imagePart = parts.find(p => p.inlineData);
        if (imagePart && imagePart.inlineData) {
            const base64Bytes = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType || 'image/jpeg';
            return { url: `data:${mimeType};base64,${base64Bytes}` };
        }
    }
    throw new Error('Gemini API did not return any image data. Response: ' + JSON.stringify(resData));
}

async function callOpenAIEngine(prompt, apiKey) {
    const url = 'https://api.openai.com/v1/images/generations';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };
    const body = JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024'
    });

    const resData = await makeHttpsPost(url, headers, body);
    if (resData.data && resData.data[0] && resData.data[0].url) {
        return { url: resData.data[0].url };
    }
    throw new Error('OpenAI API did not return any image URL. Response: ' + JSON.stringify(resData));
}

function makeHttpsPost(urlStr, headers, bodyData) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlStr);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                ...headers,
                'Content-Length': Buffer.byteLength(bodyData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Failed to parse response JSON: ' + data));
                    }
                } else {
                    reject(new Error(`API request failed with status ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(bodyData);
        req.end();
    });
}

async function redrawUserDrawing(imageBase64, style) {
    const aiProvider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
    let apiKey;
    if (aiProvider === 'openai') {
        apiKey = process.env.OPENAI_API_KEY;
    } else {
        apiKey = process.env.GEMINI_API_KEY;
    }

    let description = "A simple child-like drawing, colorful and happy";
    if (apiKey && !apiKey.startsWith('your_')) {
        try {
            description = await describeImageWithAI(imageBase64, aiProvider, apiKey);
            console.log(`AI Vision Description: "${description}"`);
        } catch (e) {
            console.warn("AI Vision description failed, using fallback. Error:", e.message);
        }
    }

    // Now generate the image using DALL-E or Gemini Imagen with the description and selected style
    const userPrompt = `Redraw this children's drawing: ${description}. The drawing style selected is ${style}.`;
    return await generateImageFromAPI(userPrompt);
}

async function describeImageWithAI(imageBase64, aiProvider, apiKey) {
    // Strip header from data url (e.g. data:image/png;base64,...)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    if (aiProvider === 'openai') {
        const url = 'https://api.openai.com/v1/chat/completions';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };
        const body = JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Describe what is drawn in this simple kid drawing in English. Focus on the main subjects, colors, and layout. Keep the description short (under 40 words).' },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/png;base64,${base64Data}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 60
        });

        const resData = await makeHttpsPost(url, headers, body);
        if (resData.choices && resData.choices[0] && resData.choices[0].message) {
            return resData.choices[0].message.content.trim();
        }
        throw new Error('OpenAI vision API failed: ' + JSON.stringify(resData));
    } else {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        const body = JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: 'Describe what is drawn in this simple kid drawing in English. Focus on the main subjects, colors, and layout. Keep the description short (under 40 words).' },
                        {
                            inlineData: {
                                mimeType: 'image/png',
                                data: base64Data
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                maxOutputTokens: 60
            }
        });

        const resData = await makeHttpsPost(url, headers, body);
        if (resData.candidates && resData.candidates[0] && resData.candidates[0].content && resData.candidates[0].content.parts[0]) {
            return resData.candidates[0].content.parts[0].text.trim();
        }
        throw new Error('Gemini vision API failed: ' + JSON.stringify(resData));
    }
}
