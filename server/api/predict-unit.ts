import { VercelRequest, VercelResponse } from '@vercel/node';
import { getAI } from './_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ai = getAI();

  try {
    const { question, units } = req.body;
    if (!question) {
      return res.status(400).json({ error: '缺少题目内容' });
    }

    const unitNames = units.map((u: any) => u.name).join('、');

    const response = await ai.chat.completions.create({
      model: process.env.AI_MODEL || 'qwen3.5-omni-flash',
      messages: [
        {
          role: 'system',
          content: `你是一个小学数学教学专家。请根据题目内容，判断它属于以下哪个单元。只返回单元名称，不要返回其他内容。可选单元：${unitNames}`,
        },
        {
          role: 'user',
          content: [{ type: 'text', text: `请判断这道题目属于哪个单元：\n${question}` }],
        },
      ],
      max_tokens: 64,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    const matched = units.find((u: any) => content.includes(u.name));
    res.json({ content, matchedUnit: matched });
  } catch (err: any) {
    console.error('预测单元错误:', err.message);
    res.status(500).json({ error: err.message || '预测失败' });
  }
}
