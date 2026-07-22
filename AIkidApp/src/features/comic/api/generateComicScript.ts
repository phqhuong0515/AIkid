import { generateApi } from '@/core/storymee';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { pollJobUntilDone } from '@/features/jobs/api/jobHooks';

import type { ComicCharacter, ComicPanel, PanelCount } from '../store/useComicDraft';

type LlmPanel = {
  action?: unknown;
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
  const source = Array.isArray(root.panels) ? root.panels : Array.isArray(root.scenes) ? root.scenes : [];
  if (!source.length) throw new Error('Kịch bản AI không có panels');
  return Array.from({ length: count }, (_, index) => {
    const value = source[index] && typeof source[index] === 'object' ? source[index] as LlmPanel : {};
    return {
      id: `${pageId}-panel-${index + 1}`,
      order: index + 1,
      action: typeof value.action === 'string' ? value.action.trim() : '',
      speaker: typeof value.speaker === 'string' ? value.speaker.trim() : '',
      dialogue: typeof value.dialogue === 'string' ? value.dialogue.trim() : '',
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
}): Promise<ComicPanel[]> {
  const ipId = useWorkspace.getState().getActiveIpId();
  if (!ipId) throw new Error('Chưa có IP/project context để tạo kịch bản');
  const castText = input.cast.length
    ? input.cast.map((item) => `${item.name} (${item.role === 'main' ? 'nhân vật chính' : 'nhân vật phụ'}): ${item.personality || item.appearancePrompt || 'đáng yêu'}`).join('; ')
    : 'AI tự đề xuất nhân vật phù hợp';
  const prompt = [
    'Bạn là biên kịch truyện tranh thiếu nhi bằng tiếng Việt.',
    `Hãy chia ý tưởng sau thành đúng ${input.panelCount} panel: ${input.idea.trim()}`,
    `Thể loại: ${input.genre}. Nhân vật: ${castText}.`,
    'Mỗi panel chỉ có một hành động rõ ràng và tối đa một câu thoại tiếng Việt tự nhiên, không quá 12 từ.',
    'Trường speaker phải khớp chính xác tên một nhân vật đã cho. Nếu không có ai nói thì speaker và dialogue đều là chuỗi rỗng.',
    'Không lặp lời thoại giữa các panel; lời thoại phải đúng với hành động của chính panel đó.',
    'Câu chuyện phải có mở đầu, diễn biến và kết thúc trọn vẹn ngay trong một trang.',
    'Chỉ trả JSON hợp lệ theo schema: {"panels":[{"action":"...","speaker":"...","dialogue":"..."}]}.',
    `Mảng panels phải có đúng ${input.panelCount} phần tử. Không markdown, không giải thích.`,
  ].join('\n');
  const jobId = await generateApi.createJob({ jobType: 'llm', prompt, ipId, childProfileId: input.childProfileId });
  const job = await pollJobUntilDone(jobId, { maxTicks: 48, pollMs: 2000 });
  const outputText = typeof job.inputParams?.outputText === 'string' ? job.inputParams.outputText : '';
  if (!outputText.trim()) throw new Error('LLM job hoàn thành nhưng không có kịch bản');
  return normalizePanels(parseRelaxedJson(outputText), input.pageId, input.panelCount);
}
