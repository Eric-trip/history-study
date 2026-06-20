// 主观题自动判分 - 关键词匹配引擎

import { EssayQuestion } from '@/types';

export interface GradingResult {
  score: number;
  maxScore: number;
  matchedKeywords: string[];
  missedKeywords: string[];
  feedback: string;
  keywordMatches: { keyword: string; matched: boolean }[];
}

// 判断答案中是否包含关键词（支持近似匹配）
function matchesKeyword(answer: string, keyword: string): boolean {
  const normalizedAnswer = answer.toLowerCase().replace(/\s/g, '');
  const normalizedKeyword = keyword.toLowerCase().replace(/\s/g, '');

  // 完全匹配
  if (normalizedAnswer.includes(normalizedKeyword)) {
    return true;
  }

  // 部分匹配 - 关键词拆分成字，每个字都在答案中
  const keywordChars = normalizedKeyword.split('');
  if (keywordChars.every((char) => normalizedAnswer.includes(char))) {
    return true;
  }

  // 模糊匹配 - 关键词的前半部分
  if (normalizedKeyword.length >= 4) {
    const half = normalizedKeyword.slice(0, Math.floor(normalizedKeyword.length / 2));
    if (normalizedAnswer.includes(half)) {
      return true;
    }
  }

  return false;
}

export function gradeEssay(question: EssayQuestion, answer: string): GradingResult {
  const keywordMatches = question.keywords.map((keyword) => ({
    keyword,
    matched: matchesKeyword(answer, keyword),
  }));

  const matchedKeywords = keywordMatches.filter((km) => km.matched).map((km) => km.keyword);
  const missedKeywords = keywordMatches.filter((km) => !km.matched).map((km) => km.keyword);

  const matchRate = question.keywords.length > 0
    ? matchedKeywords.length / question.keywords.length
    : 0;

  // 按匹配率计算得分
  const score = Math.round(matchRate * question.points);

  // 生成反馈
  let feedback = '';
  if (matchRate >= 0.8) {
    feedback = '回答得很好！关键点基本都覆盖了。';
  } else if (matchRate >= 0.5) {
    feedback = '回答尚可，但还有重要得分点遗漏，建议对照参考答案补充。';
  } else if (matchRate >= 0.3) {
    feedback = '回答不够完整，很多关键点没有提到，请仔细看参考答案。';
  } else {
    feedback = '回答偏离了主要得分点，建议重新复习相关知识点。';
  }

  // 检查是否分点作答
  const hasBulletPoints = /①|②|③|④|⑤|⑥|⑦|⑧|⑨|⑩|1[.、]|2[.、]|3[.、]|4[.、]|5[.、]/.test(answer);
  if (!hasBulletPoints && answer.length > 50) {
    feedback += ' 注意：建议分点作答（①②③④），阅卷老师更容易找到得分点。';
  }

  // 检查篇幅
  if (answer.length < 30) {
    feedback += ' 答案太简短，主观题需要一定的展开和论述。';
  }

  return {
    score,
    maxScore: question.points,
    matchedKeywords,
    missedKeywords,
    feedback,
    keywordMatches,
  };
}
