import { generateApi } from '@/core/storymee';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { pollJobUntilDone } from '@/features/jobs/api/jobHooks';

export type StoryWritingStage = 'opening' | 'development' | 'ending';
export type StoryOutline = Record<StoryWritingStage, string>;

async function runStoryLlm(prompt: string, task: string): Promise<string> {
  const ipId = useWorkspace.getState().getActiveIpId();
  if (!ipId) throw new Error('Chưa có IP/project context để nhờ AI hỗ trợ');
  const jobId = await generateApi.createJob({
    jobType: 'llm',
    prompt,
    ipId,
    extraInputParams: { task },
  });
  const job = await pollJobUntilDone(jobId, { maxTicks: 72, pollMs: 2500 });
  const outputText = typeof job.inputParams?.outputText === 'string' ? job.inputParams.outputText.trim() : '';
  if (!outputText) throw new Error('AI chưa trả về nội dung gợi ý');
  return outputText.replace(/```(?:json|text)?/gi, '').replace(/```/g, '').trim();
}

export async function generateStoryWritingAssist(input: {
  stage: StoryWritingStage;
  plot: string;
  outline: string;
  currentDraft: string;
}): Promise<string> {
  const stageLabel = input.stage === 'opening' ? 'mở đầu' : input.stage === 'development' ? 'diễn biến' : 'kết thúc';
  const prompt = [
    'Bạn là trợ lý viết truyện cho học sinh 9–15 tuổi.',
    `Hãy gợi ý một đoạn ${stageLabel} bằng tiếng Việt dựa trên thông tin sau.`,
    `Cốt truyện: ${input.plot || 'Chưa có mô tả'}.`,
    `Ý chính của phần này: ${input.outline || 'Chưa ghi'}.`,
    `Bản học sinh đang viết: ${input.currentDraft || 'Chưa viết'}.`,
    'Viết 2–4 câu, rõ ràng, giàu hình ảnh nhưng không quá trẻ con.',
    'Giữ nguyên ý tưởng của học sinh, không thêm nhân vật hoặc sự kiện mâu thuẫn với cốt truyện.',
    'Chỉ trả về đoạn văn gợi ý, không tiêu đề, không markdown và không giải thích.',
  ].join('\n');

  return runStoryLlm(prompt, `aikids-story-writing-assist-${input.stage}`);
}

export async function generateOutlineFromPlot(plotFramework: string): Promise<StoryOutline> {
  const raw = await runStoryLlm([
    'Bạn là giáo viên hướng dẫn học sinh 9–15 tuổi lập dàn ý truyện chữ.',
    'Hãy chuyển KHUNG CỐT TRUYỆN 4 mốc dưới đây thành DÀN Ý TRUYỆN CHỮ 3 phần.',
    plotFramework,
    'Quy tắc bắt buộc:',
    '- opening bám sát mốc Mở đầu, giới thiệu nhân vật và tình huống.',
    '- development kết nối mốc Biến cố và Cao trào, thể hiện nguyên nhân, thử thách và hành động.',
    '- ending bám sát mốc Kết quả, giải quyết vấn đề và nêu thay đổi của nhân vật.',
    '- Không thêm nhân vật, bối cảnh hoặc kết quả mâu thuẫn với khung.',
    'Mỗi phần viết 1–2 câu ý chính, chưa viết thành truyện hoàn chỉnh.',
    'Chỉ trả JSON: {"opening":"...","development":"...","ending":"..."}.',
  ].join('\n'), 'aikids-story-outline');
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('AI chưa trả về dàn ý đúng định dạng');
  const parsed = JSON.parse(raw.slice(start, end + 1)) as Partial<StoryOutline>;
  if (!parsed.opening || !parsed.development || !parsed.ending) throw new Error('Dàn ý AI còn thiếu nội dung');
  return { opening: parsed.opening, development: parsed.development, ending: parsed.ending };
}

export async function reviewOutlineAgainstPlot(plotFramework: string, outline: StoryOutline): Promise<string> {
  return runStoryLlm([
    'Bạn là giáo viên kiểm tra dàn ý truyện của học sinh 9–15 tuổi.',
    'KHUNG CỐT TRUYỆN:',
    plotFramework,
    'DÀN Ý HỌC SINH:',
    `Mở đầu: ${outline.opening}`,
    `Diễn biến: ${outline.development}`,
    `Kết thúc: ${outline.ending}`,
    'Kiểm tra dàn ý có giữ đúng nhân vật, bối cảnh, biến cố, cao trào và kết quả hay không.',
    'Trả lời ngắn gọn theo mẫu: "Bám sát" hoặc "Cần chỉnh", sau đó nêu tối đa 2 điều cụ thể cần giữ/sửa. Không viết lại toàn bộ dàn ý.',
  ].join('\n'), 'aikids-story-outline-review');
}

export async function editStoryTextAgainstPlot(plotFramework: string, storyText: string): Promise<string> {
  return runStoryLlm([
    'Bạn là biên tập viên hỗ trợ học sinh 9–15 tuổi hoàn thiện truyện chữ.',
    'KHUNG CỐT TRUYỆN BẮT BUỘC GIỮ ĐÚNG:',
    plotFramework,
    'BẢN TRUYỆN CỦA HỌC SINH:',
    storyText,
    'Hãy biên tập lại câu chữ để truyện mạch lạc, chuyển đoạn tự nhiên, giảm lặp từ và sửa lỗi chính tả.',
    'Không thay đổi nhân vật, bối cảnh, biến cố, cao trào hoặc kết quả. Không thêm tình tiết làm lệch cốt truyện.',
    'Giữ giọng văn và ý tưởng của học sinh; không rút gọn thành tóm tắt.',
    'Giữ đúng 3 phần Mở đầu, Diễn biến, Kết thúc và ngăn cách chúng bằng một dòng trống.',
    'Chỉ trả về bản truyện đã biên tập, không tiêu đề phụ, không markdown và không giải thích.',
  ].join('\n'), 'aikids-story-editor');
}
