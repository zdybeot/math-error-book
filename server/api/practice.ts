import { VercelRequest, VercelResponse } from '@vercel/node';
import { getAI } from './_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ai = getAI();

  try {
    const { errorQuestions, count = 2 } = req.body;
    if (!errorQuestions || errorQuestions.length === 0) {
      return res.status(400).json({ error: '缺少错题数据' });
    }

    const errorContext = errorQuestions
      .slice(0, 10)
      .map((e: any, i: number) => `错题 ${i + 1}：${e.question}\n  正确答案：${e.correctAnswer}\n  知识点：${e.tags.join('、')}`)
      .join('\n\n');

    const response = await ai.chat.completions.create({
      model: process.env.AI_MODEL || 'qwen3.5-omni-flash',
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
    });

    const content = response.choices[0]?.message?.content || '';
    res.json({ content });
  } catch (err: any) {
    console.error('出题错误:', err.message);
    res.status(500).json({ error: err.message || '生成题目失败' });
  }
}
