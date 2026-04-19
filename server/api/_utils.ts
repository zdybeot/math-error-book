// Vercel Serverless Functions
// 每个文件自动映射到对应的 API 路径

import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// 从环境变量读取配置，更换模型只需修改 Vercel 环境变量
export const AI_API_KEY = process.env.AI_API_KEY || '';
export const AI_MODEL = process.env.AI_MODEL || 'qwen3.5-omni-flash';
export const AI_BASE_URL = process.env.AI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

export function getAI(): OpenAI {
  return new OpenAI({
    apiKey: AI_API_KEY,
    baseURL: AI_BASE_URL,
  });
}
