// AI 智能判分接口（预留 + 可选启用）
// 目前使用关键词匹配，未来可接入大模型API

import { EssayQuestion } from '@/types';
import { gradeEssay, GradingResult } from './grader';

export interface AIGradingResult extends GradingResult {
  aiFeedback?: string;
  suggestions?: string[];
}

// AI 判分（模拟 - 实际可接入大模型API）
export async function gradeEssayWithAI(
  question: EssayQuestion,
  answer: string
): Promise<AIGradingResult> {
  // 先用关键词匹配做基础判分
  const baseResult = gradeEssay(question, answer);

  // 这里预留AI接口，未来可以接入大模型API
  // 例如：
  // const response = await fetch('/api/ai-grade', {
  //   method: 'POST',
  //   body: JSON.stringify({ question: question.question, answer, referenceAnswer: question.referenceAnswer }),
  // });
  // const aiResult = await response.json();
  // return { ...baseResult, aiFeedback: aiResult.feedback, suggestions: aiResult.suggestions };

  // 目前返回基础结果 + 模拟AI建议
  const suggestions = generateSuggestions(question, answer, baseResult);

  return {
    ...baseResult,
    suggestions,
  };
}

// 生成学习建议
function generateSuggestions(
  question: EssayQuestion,
  answer: string,
  result: GradingResult
): string[] {
  const suggestions: string[] = [];

  // 检查答案长度
  if (answer.length < 30) {
    suggestions.push('答案太简短，主观题需要展开论述，每点至少一句话');
  }

  // 检查是否分点
  const hasBulletPoints = /①|②|③|④|⑤|1[.、]|2[.、]|3[.、]/.test(answer);
  if (!hasBulletPoints && answer.length > 50) {
    suggestions.push('建议分点作答（①②③④），让阅卷老师更容易找到得分点');
  }

  // 检查遗漏的关键词
  if (result.missedKeywords.length > 0) {
    suggestions.push(`注意补充以下要点：${result.missedKeywords.join('、')}`);
  }

  // 检查是否使用了历史术语
  const hasTerms = /促进了|推动了|标志着|奠定了|巩固了|加强了|顺应了/.test(answer);
  if (!hasTerms) {
    suggestions.push('多使用历史术语，如"促进了""标志着""奠定了……基础"等');
  }

  // 检查史论结合
  const hasFacts = /\d|年|朝|帝|王|战|法|约|制/.test(answer);
  if (!hasFacts) {
    suggestions.push('注意史论结合，用具体史实支撑你的论点');
  }

  // 根据得分给出建议
  const ratio = result.score / result.maxScore;
  if (ratio < 0.5) {
    suggestions.push(`建议复习"${question.unit}"相关知识，重点掌握${question.keywords.slice(0, 2).join('、')}等要点`);
  }

  return suggestions;
}
