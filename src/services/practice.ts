import { AI_API_KEY, AI_MODEL, AI_BASE_URL } from '@/src/config/ai';

export interface PracticeQuestion {
  question: string;
  answer: string;
  type: string;
}

/**
 * 根据错题集合生成相似练习题目
 *
 * @param errorQuestions 当前单元的错题题目和知识点列表
 * @param count 生成题目数量
 * @returns 生成的相似题目列表
 */
export async function generateSimilarQuestions(
  errorQuestions: Array<{ question: string; correctAnswer: string; tags: string[] }>,
  count: number = 2
): Promise<PracticeQuestion[]> {
  if (!AI_API_KEY) {
    throw new Error('未配置 API Key');
  }

  if (errorQuestions.length === 0) {
    throw new Error('没有错题数据，无法生成练习');
  }

  // 构造错题上下文
  const errorContext = errorQuestions
    .slice(0, 10) // 最多取 10 道错题作为上下文
    .map(
      (e, i) =>
        `错题 ${i + 1}：${e.question}\n  正确答案：${e.correctAnswer}\n  知识点：${e.tags.join('、')}`
    )
    .join('\n\n');

  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一个小学数学出题专家。请根据学生做错的题目，生成相似的练习题目。新题目要考查相同或类似的知识点，但改变具体数字和表述。适合四年级学生水平。返回格式为 JSON 数组：[{"question":"题目","answer":"答案","type":"题型"}]',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `以下是学生做错的题目：\n\n${errorContext}\n\n请根据以上错题，生成 ${count} 道相似的练习题。要求：\n1. 考查相同的知识点\n2. 改变具体的数字\n3. 难度与原题相当\n4. 题型可以多样化（计算题、应用题、填空题等）`,
            },
          ],
        },
      ],
      max_tokens: 1024,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`生成题目失败: ${response.status} ${errorData}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('API 返回空结果');
  }

  return parsePracticeResponse(content);
}

/**
 * 针对单道错题生成相似练习题目
 */
export async function generatePracticeForSingleQuestion(
  question: string,
  correctAnswer: string,
  tags: string[],
  count: number = 2
): Promise<PracticeQuestion[]> {
  if (!AI_API_KEY) {
    throw new Error('未配置 API Key');
  }

  if (!question.trim()) {
    throw new Error('题目内容为空，无法生成练习');
  }

  const tagsText = tags.length > 0 ? tags.join('、') : '小学数学';

  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一个小学数学出题专家。请根据学生做错的一道题目，生成相似的练习题目。新题目要考查相同或类似的知识点，但改变具体数字和表述。适合小学生水平。返回格式为 JSON 数组：[{"question":"题目","answer":"答案","type":"题型"}]',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `这道题我做错了：\n题目：${question}\n正确答案：${correctAnswer}\n知识点：${tagsText}\n\n请根据这道错题，生成 ${count} 道相似的练习题。要求：\n1. 考查相同的知识点\n2. 改变具体的数字和表述\n3. 难度与原题相当\n4. 题型可以多样化（计算题、应用题、填空题等）`,
            },
          ],
        },
      ],
      max_tokens: 1024,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`生成题目失败: ${response.status} ${errorData}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('API 返回空结果');
  }

  return parsePracticeResponse(content);
}

/**
 * 解析 AI 返回的练习题目内容
 */
function parsePracticeResponse(content: string): PracticeQuestion[] {
  try {
    let jsonStr = content;
    // 尝试提取 JSON
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonStr.trim());
    const arr = Array.isArray(parsed) ? parsed : [parsed];

    return arr
      .filter((item: any) => item && item.question)
      .map((item: any) => ({
        question: item.question || '',
        answer: item.answer || '',
        type: item.type || '练习题',
      }));
  } catch {
    // 如果无法解析，按行解析
    const lines = content.split('\n').filter((l) => l.trim());
    return lines.map((line, i) => ({
      question: line.replace(/^\d+[\.\、\)]\s*/, ''),
      answer: '—',
      type: '练习题',
    }));
  }
}
