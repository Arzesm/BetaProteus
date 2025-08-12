export interface StressQuestion {
  question: string;
  options: {
    text: string;
    score: number;
  }[];
}

export const stressTestQuestions: StressQuestion[] = [
  {
    question: "Как часто вы чувствуете напряжение или раздражение?",
    options: [
      { text: "Почти никогда", score: 0 },
      { text: "Иногда", score: 1 },
      { text: "Часто", score: 2 },
      { text: "Почти постоянно", score: 3 }
    ]
  },
  {
    question: "Насколько хорошо вы спите?",
    options: [
      { text: "Очень хорошо", score: 0 },
      { text: "Нормально", score: 1 },
      { text: "Плохо", score: 2 },
      { text: "Очень плохо", score: 3 }
    ]
  },
  {
    question: "Как часто у вас бывают головные боли или другие физические симптомы стресса?",
    options: [
      { text: "Очень редко", score: 0 },
      { text: "Иногда", score: 1 },
      { text: "Довольно часто", score: 2 },
      { text: "Почти каждый день", score: 3 }
    ]
  }
];

export const stressTestResults = [
  { min: 0, max: 3, title: "Низкий уровень стресса", description: "Вы хорошо справляетесь со стрессом. Продолжайте практиковать здоровые привычки!" },
  { min: 4, max: 6, title: "Умеренный уровень стресса", description: "У вас есть некоторые признаки стресса. Попробуйте больше отдыхать и находить время для релаксации." },
  { min: 7, max: 9, title: "Высокий уровень стресса", description: "Ваш уровень стресса повышен. Рекомендуется уделить больше внимания методам релаксации и, возможно, проконсультироваться со специалистом." }
];