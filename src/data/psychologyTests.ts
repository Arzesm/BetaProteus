import { Activity, Layers, Crown } from "lucide-react";

export interface TestQuestion {
  question: string;
  options: {
    text: string;
    score: number;
  }[];
}

export interface TestConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  questions: TestQuestion[];
  results: {
    min: number;
    max: number;
    title: string;
    description: string;
  }[];
}

// MBTI Test (уже существующий)
export const mbtiTest: TestConfig = {
  id: 'mbti',
  title: 'Тест MBTI',
  description: 'Определите ваш тип личности по методике Майерс-Бриггс',
  icon: Layers,
  questions: [
    {
      question: "После долгого общения с людьми на вечеринке, вы чувствуете себя:",
      options: [
        { text: "Уставшим и нуждающимся в отдыхе в одиночестве", score: 0 },
        { text: "Полным энергии и вдохновения", score: 1 }
      ]
    },
    // ... остальные вопросы MBTI
  ],
  results: [
    // ... результаты MBTI
  ]
};

// Big Five Test
export const bigFiveTest: TestConfig = {
  id: 'big-five',
  title: 'Тест Big Five',
  description: 'Оцените свои черты личности по пятифакторной модели',
  icon: Layers,
  questions: [
    {
      question: "Я человек, который...",
      options: [
        { text: "Общительный, разговорчивый", score: 2 },
        { text: "Сдержанный, предпочитаю одиночество", score: 0 },
        { text: "Где-то посередине", score: 1 }
      ]
    },
    {
      question: "Я склонен к сотрудничеству и избегаю конфликтов",
      options: [
        { text: "Полностью согласен", score: 2 },
        { text: "Скорее согласен", score: 1 },
        { text: "Нейтрален", score: 0 },
        { text: "Скорее не согласен", score: -1 },
        { text: "Полностью не согласен", score: -2 }
      ]
    },
    // ... еще 8 вопросов
  ],
  results: [
    {
      min: -10,
      max: -5,
      title: "Низкие показатели",
      description: "Ваши результаты ниже среднего по нескольким факторам"
    },
    // ... другие диапазоны результатов
  ]
};

// Archetype Test
export const archetypeTest: TestConfig = {
  id: 'archetypes',
  title: 'Тест на архетипы',
  description: 'Определите свои доминирующие психологические архетипы',
  icon: Crown,
  questions: [
    {
      question: "В сложной ситуации я обычно:",
      options: [
        { text: "Ищу решение проблемы", score: { hero: 1 } },
        { text: "Пытаюсь понять скрытые причины", score: { sage: 1 } },
        { text: "Забочусь о чувствах окружающих", score: { caregiver: 1 } }
      ]
    },
    // ... еще вопросы
  ],
  results: [
    {
      min: 0,
      max: 100,
      title: "Герой",
      description: "Вы стремитесь доказать свою ценность через смелые поступки"
    },
    // ... другие архетипы
  ]
};

export const allTests = [mbtiTest, bigFiveTest, archetypeTest];