import { generateApi } from '@/core/storymee';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { pollJobUntilDone } from '@/features/jobs/api/jobHooks';

import type { ComicCharacter, ComicPanel, PanelCount } from '../store/useComicDraft';

type LlmPanel = {
  action?: unknown;
  title?: unknown;
  summary?: unknown;
  speaker?: unknown;
  dialogue?: unknown;
};

function parseRelaxedJson(raw: string): unknown {
  const withoutFence = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = withoutFence.indexOf('{');
  const end = withoutFence.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('LLM không trả về JSON kịch bản');
  const json = withoutFence.slice(start, end + 1).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
  return JSON.parse(json);
}

function normalizePanels(raw: unknown, pageId: string, count: PanelCount): ComicPanel[] {
  const root = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const source = Array.isArray(root.beats) ? root.beats : Array.isArray(root.panels) ? root.panels : Array.isArray(root.scenes) ? root.scenes : [];
  if (!source.length) throw new Error('AI chưa trả về khung cốt truyện');
  return Array.from({ length: count }, (_, index) => {
    const value = source[index] && typeof source[index] === 'object' ? source[index] as LlmPanel : {};
    const beatTitle = typeof value.title === 'string' ? value.title.trim() : '';
    const beatSummary = typeof value.summary === 'string'
      ? value.summary.trim()
      : typeof value.action === 'string' ? value.action.trim() : '';
    return {
      id: `${pageId}-panel-${index + 1}`,
      order: index + 1,
      action: beatTitle ? `${beatTitle}: ${beatSummary}` : beatSummary,
      speaker: '',
      dialogue: '',
      status: 'draft',
      jobId: null,
      imageUrl: null,
      error: null,
    };
  });
}

export async function generateComicScriptViaGateway(input: {
  pageId: string;
  idea: string;
  genre: string;
  panelCount: PanelCount;
  cast: ComicCharacter[];
  childProfileId?: string;
  provider?: string;
}): Promise<ComicPanel[]> {
  const ipId = useWorkspace.getState().getActiveIpId();
  if (!ipId) throw new Error('Chưa có IP/project context để tạo kịch bản');
  const castText = input.cast.length
    ? input.cast.map((item) => `${item.name} (${item.role === 'main' ? 'nhân vật chính' : 'nhân vật phụ'}): ${item.personality || item.appearancePrompt || 'đáng yêu'}`).join('; ')
    : 'AI tự đề xuất nhân vật phù hợp';
  const prompt = [
    'Bạn là người hướng dẫn xây dựng cốt truyện cho học sinh 9–15 tuổi.',
    `Hãy phát triển ý tưởng sau thành đúng ${input.panelCount} mốc của KHUNG CỐT TRUYỆN: ${input.idea.trim()}`,
    `Thể loại: ${input.genre}. Nhân vật: ${castText}.`,
    'Đây chưa phải truyện chữ và chưa phải kịch bản tranh: không viết văn dài, không chia panel, không tạo lời thoại.',
    'Mỗi mốc chỉ mô tả sự kiện cốt lõi và quan hệ nguyên nhân–kết quả trong 1–2 câu.',
    'Bốn vai trò theo thứ tự: Mở đầu, Biến cố, Cao trào, Kết quả.',
    'Chỉ trả JSON hợp lệ theo schema: {"beats":[{"title":"Mở đầu","summary":"..."},{"title":"Biến cố","summary":"..."},{"title":"Cao trào","summary":"..."},{"title":"Kết quả","summary":"..."}]}.',
    `Mảng beats phải có đúng ${input.panelCount} phần tử. Không markdown, không giải thích.`,
  ].join('\n');
  // Provider routing belongs to Hub/core-job-api. When no explicit override is
  // requested, omit provider and _mediaRoute so Hub starts the canonical LLM
  // route at Vertex and owns any retry/fallback transition.
  const provider = input.provider;
  const jobId = await generateApi.createJob({
    jobType: 'llm',
    prompt,
    provider,
    ipId,
    childProfileId: input.childProfileId,
    extraInputParams: {
      ...(provider ? { provider } : {}),
      task: 'aikids-plot-framework',
      response_format: 'json',
    },
  });
  const job = await pollJobUntilDone(jobId, { maxTicks: 72, pollMs: 2500 });
  const outputText = typeof job.inputParams?.outputText === 'string' ? job.inputParams.outputText : '';
  if (!outputText.trim()) throw new Error('LLM job hoàn thành nhưng không có kịch bản');
  return normalizePanels(parseRelaxedJson(outputText), input.pageId, input.panelCount);
}
