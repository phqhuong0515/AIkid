import { generateApi } from '@/core/storymee';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { pollJobUntilDone } from '@/features/jobs/api/jobHooks';

export type SuggestedComicPanel = {
  content: string;
  characterNames: string[];
  dialogue: string;
};

function parseSuggestedPanels(raw: string, panelCount: number): SuggestedComicPanel[] {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('AI chưa trả khung tranh đúng định dạng');
  const parsed = JSON.parse(raw.slice(start, end + 1)) as { panels?: SuggestedComicPanel[] };
  if (!Array.isArray(parsed.panels) || parsed.panels.length !== panelCount) {
    throw new Error('Số khung AI trả về chưa đúng');
  }
  return parsed.panels.map((panel) => ({
    content: String(panel.content || '').trim(),
    characterNames: Array.isArray(panel.characterNames) ? panel.characterNames.map(String) : [],
    dialogue: String(panel.dialogue || '').trim(),
  }));
}

function restoreMentionedCharacters(
  panels: SuggestedComicPanel[],
  allowedNames: string[],
): SuggestedComicPanel[] {
  return panels.map((panel) => {
    if (panel.characterNames.length > 0) return panel;
    if (allowedNames.length === 1) {
      return { ...panel, characterNames: [allowedNames[0]] };
    }
    const content = panel.content.toLocaleLowerCase('vi');
    const mentioned = allowedNames.filter((name) => {
      const normalized = name.toLocaleLowerCase('vi');
      const meaningfulParts = normalized.split(/\s+/).filter((part) => part.length >= 3);
      return content.includes(normalized) || meaningfulParts.some((part) => content.includes(part));
    });
    return mentioned.length ? { ...panel, characterNames: mentioned } : panel;
  });
}

async function runComicLlm(prompt: string, task: string): Promise<string> {
  const ipId = useWorkspace.getState().getActiveIpId();
  if (!ipId) throw new Error('Chưa có IP/project context để nhờ AI hỗ trợ');
  const jobId = await generateApi.createJob({
    jobType: 'llm',
    prompt,
    ipId,
    extraInputParams: { task },
  });
  const job = await pollJobUntilDone(jobId, { maxTicks: 72, pollMs: 2500 });
  const output = typeof job.inputParams?.outputText === 'string' ? job.inputParams.outputText.trim() : '';
  if (!output) throw new Error('AI chưa trả về nội dung panel');
  return output.replace(/```(?:json|text)?/gi, '').replace(/```/g, '').trim();
}

export async function generateComicPanelsFromSource(input: {
  sourceText: string;
  panelCount: number;
  characterNames: string[];
}): Promise<SuggestedComicPanel[]> {
  const raw = await runComicLlm([
    'Bạn là biên kịch chuyển thể truyện thành storyboard cho học sinh 9–15 tuổi.',
    `Hãy chia nội dung nguồn thành đúng ${input.panelCount} panel theo trình tự nguyên nhân–kết quả.`,
    'NỘI DUNG NGUỒN:',
    input.sourceText,
    `NHÂN VẬT ĐƯỢC PHÉP DÙNG: ${input.characterNames.join(', ') || 'không có tên cụ thể'}.`,
    'Mỗi panel gồm:',
    '- content: mô tả một khoảnh khắc có thể vẽ thành một hình, nêu rõ hành động và bối cảnh.',
    '- characterNames: chỉ dùng tên trong danh sách được phép và chỉ chọn nhân vật thực sự xuất hiện.',
    '- Nếu content hoặc nội dung nguồn nhắc tới một nhân vật được phép, phải đưa đúng tên đó vào characterNames.',
    '- dialogue: nếu characterNames có nhân vật, BẮT BUỘC viết đúng một câu nhân vật nói hoặc nghĩ, dài 4–12 từ, tự nhiên và phù hợp đúng khoảnh khắc.',
    '- Chỉ để dialogue rỗng khi characterNames là mảng rỗng. Không dùng lời kể của người dẫn chuyện.',
    '- Câu thoại không được chép lại nguyên văn mô tả cảnh và không được tiết lộ trước sự việc ở khung sau.',
    'Không thêm nhân vật, bối cảnh, biến cố hay kết quả ngoài nội dung nguồn.',
    'Các panel phải liên kết, không lặp cùng một khoảnh khắc.',
    `Chỉ trả JSON: {"panels":[{"content":"...","characterNames":["..."],"dialogue":"..."}]}. Mảng phải có đúng ${input.panelCount} phần tử.`,
  ].join('\n'), 'aikids-comic-panel-breakdown');
  const panels = restoreMentionedCharacters(
    parseSuggestedPanels(raw, input.panelCount),
    input.characterNames,
  );
  const missingDialogue = panels.some((panel) => panel.characterNames.length > 0 && !panel.dialogue);
  if (!missingDialogue) return panels;

  const repairedRaw = await runComicLlm([
    'Hãy sửa JSON storyboard dưới đây. Giữ nguyên content và characterNames.',
    'Với mọi phần tử có characterNames không rỗng nhưng dialogue đang rỗng, hãy viết đúng một câu thoại hoặc suy nghĩ tự nhiên dài 4–12 từ.',
    'Câu thoại phải bám đúng cảnh, không kể lại mô tả và không tiết lộ khung sau.',
    'Chỉ phần tử không có nhân vật mới được để dialogue rỗng.',
    `Chỉ trả JSON có đúng ${input.panelCount} phần tử theo cấu trúc cũ.`,
    JSON.stringify({ panels }),
  ].join('\n'), 'aikids-comic-panel-dialogue-repair');
  const repaired = restoreMentionedCharacters(
    parseSuggestedPanels(repairedRaw, input.panelCount),
    input.characterNames,
  );
  if (repaired.some((panel) => panel.characterNames.length > 0 && !panel.dialogue)) {
    throw new Error('AI chưa gợi ý đủ lời thoại. Em hãy thử lại một lần nữa.');
  }
  return repaired;
}

export async function reviewComicPanelsAgainstSource(input: {
  sourceText: string;
  panels: SuggestedComicPanel[];
}): Promise<string> {
  return runComicLlm([
    'Bạn là giáo viên kiểm tra storyboard truyện tranh của học sinh 9–15 tuổi.',
    'NỘI DUNG NGUỒN:',
    input.sourceText,
    'CÁC PANEL:',
    ...input.panels.map((panel, index) => `${index + 1}. Cảnh: ${panel.content} | Nhân vật: ${panel.characterNames.join(', ')} | Thoại: ${panel.dialogue || '(không có)'}`),
    'Kiểm tra: đúng trình tự, đủ mốc chính, không thêm sai tình tiết, nhân vật đúng cảnh, thoại phù hợp và không kể lặp.',
    'Trả lời ngắn gọn bắt đầu bằng "Bám sát" hoặc "Cần chỉnh", sau đó nêu tối đa 3 góp ý cụ thể theo số panel.',
  ].join('\n'), 'aikids-comic-panel-review');
}
