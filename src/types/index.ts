// 历史学习网站 - 类型定义

// 教材册别
export type BookId = 'grade7-up' | 'grade7-down' | 'grade8-up' | 'grade8-down' | 'grade9-up' | 'grade9-down';

// 题目类型
export type QuestionType = 'choice' | 'short-answer' | 'essay';

// 选择题
export interface ChoiceQuestion {
  id: string;
  type: 'choice';
  bookId: BookId;
  unit: string;
  question: string;
  options: { label: string; text: string }[];
  answer: string; // 正确选项 label, e.g. "A"
  explanation: string;
  difficulty: 1 | 2 | 3;
}

// 主观题
export interface EssayQuestion {
  id: string;
  type: 'short-answer' | 'essay';
  bookId: BookId;
  unit: string;
  question: string;
  keywords: string[]; // 踩分关键词
  referenceAnswer: string; // 参考答案
  explanation: string;
  difficulty: 1 | 2 | 3;
  points: number; // 总分
}

export type Question = ChoiceQuestion | EssayQuestion;

// 知识点
export interface KnowledgePoint {
  id: string;
  bookId: BookId;
  unit: string;
  title: string;
  content: string;
  keyTerms: string[]; // 核心术语
  importance: 'high' | 'medium' | 'low';
}

// 答题技巧
export interface TipCard {
  id: string;
  category: string; // 审题、答题规范、题型公式、材料分析
  title: string;
  content: string;
  example?: string;
}

// 错题本
export interface WrongAnswer {
  id: string;
  questionId: string;
  questionType: QuestionType;
  questionText: string;
  myAnswer: string;
  correctAnswer: string;
  reason: string; // 丢分原因
  bookId: BookId;
  createdAt: number;
  reviewed: boolean;
}

// 学习记录
export interface StudyRecord {
  date: string; // YYYY-MM-DD
  totalQuestions: number;
  correctCount: number;
  studyTime: number; // 分钟
}

// 打卡记录
export interface StreakRecord {
  date: string;
  completed: boolean;
}

// 积分 & 成就
export interface Progress {
  totalPoints: number;
  level: number;
  streak: number;
  lastStudyDate: string;
  achievements: string[];
  totalAnswered: number;
  totalCorrect: number;
}

// 成就定义
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (progress: Progress) => boolean;
}

// 每日一练
export interface DailyPractice {
  date: string;
  questions: string[]; // question IDs
}

// 模拟测试
export interface MockExam {
  id: string;
  title: string;
  bookId: BookId;
  questionIds: string[];
  timeLimit: number; // 分钟
  createdAt: number;
}

// 答题技巧卡片
export interface TipCard {
  id: string;
  category: string;
  title: string;
  content: string;
  example?: string;
}
