# 史学堂 · 初中历史学习平台

人教版初中历史学习平台，涵盖初一至初三6册内容。专注于帮助初中生提高历史成绩，特别是主观题答题能力。

## 功能

- **学习概览** — 打卡streak、积分等级、正确率统计、成就徽章
- **知识点梳理** — 人教版6册课本完整目录 + 核心知识点摘要
- **答题技巧卡片** — 20张主观题答题技巧，涵盖审题、题型公式、材料分析、答题规范、日常提升
- **题库练习** — 120道题（选择题+主观题），选择题自动判分，主观题关键词匹配判分
- **错题本** — 自动收录错题 + 手动添加，支持标记已复习
- **模拟测试** — 选册别+题量，限时答题，交卷后出成绩单
- **每日一练** — 每天5道题，连续打卡记录

## 技术栈

- **框架**: Next.js 16 (静态导出)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **UI组件**: shadcn/ui
- **数据存储**: 浏览器 localStorage（无需后端）
- **部署**: GitHub Pages

## 本地运行

```bash
# 安装依赖
bun install

# 开发模式
bun run dev

# 构建静态文件
bun run build
```

## 在线访问

https://eric-trip.github.io/history-study/

## 项目结构

```
src/
├── app/                    # Next.js 页面
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 主页（单页应用）
│   └── globals.css         # 全局样式（竹简古籍风）
├── components/
│   ├── ui/                 # shadcn/ui 基础组件
│   └── history/            # 历史学习功能组件
│       ├── Dashboard.tsx       # 学习概览
│       ├── KnowledgeView.tsx   # 知识点
│       ├── TipsView.tsx        # 答题技巧
│       ├── PracticeView.tsx    # 题库练习
│       ├── WrongBook.tsx       # 错题本
│       ├── MockExam.tsx        # 模拟测试
│       └── DailyPractice.tsx   # 每日一练
├── data/                   # 静态数据
│   ├── books.ts            # 教材目录
│   ├── knowledge.ts        # 知识点内容
│   ├── questions.ts        # 题库
│   └── tips.ts             # 答题技巧卡片
├── lib/                    # 工具函数
│   ├── storage.ts          # 本地存储管理
│   ├── grader.ts           # 主观题判分引擎
│   └── utils.ts            # 通用工具
└── types/
    └── index.ts            # TypeScript 类型定义
```

## 添加自定义题目

编辑 `src/data/questions.ts`，按照已有格式添加即可：

```typescript
// 选择题
{
  id: 'q-7u-099',
  type: 'choice',
  bookId: 'grade7-up',
  unit: '第一单元',
  question: '你的题目',
  options: [
    { label: 'A', text: '选项A' },
    { label: 'B', text: '选项B' },
    { label: 'C', text: '选项C' },
    { label: 'D', text: '选项D' },
  ],
  answer: 'B',
  explanation: '解析说明',
  difficulty: 1,
}
```

## License

MIT
