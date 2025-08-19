import { Brain, Target, Users, Heart, Zap } from "lucide-react";

export interface BigFiveQuestion {
  id: number;
  question: string;
  factor: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';
  isReversed: boolean;
}

export interface BigFiveResult {
  factor: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: 'very_low' | 'low' | 'average' | 'high' | 'very_high';
  description: string;
  traits: string[];
}

export interface BigFiveTestConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  questions: BigFiveQuestion[];
  factors: {
    openness: { name: string; icon: React.ComponentType<any>; description: string };
    conscientiousness: { name: string; icon: React.ComponentType<any>; description: string };
    extraversion: { name: string; icon: React.ComponentType<any>; description: string };
    agreeableness: { name: string; icon: React.ComponentType<any>; description: string };
    neuroticism: { name: string; icon: React.ComponentType<any>; description: string };
  };
}

// Все 112 вопросов теста Big Five
export const bigFiveQuestions: BigFiveQuestion[] = [
  // Фактор 1: Открытость опыту (Openness) - вопросы 1-24
  { id: 1, question: "Мне легко придумывать новые идеи.", factor: 'openness', isReversed: false },
  { id: 2, question: "Я часто думаю о вещах, которых не существует в реальности.", factor: 'openness', isReversed: false },
  { id: 3, question: "Я люблю пробовать новые виды искусства.", factor: 'openness', isReversed: false },
  { id: 4, question: "Искусство редко вызывает у меня сильные чувства.", factor: 'openness', isReversed: true },
  { id: 5, question: "Я часто задумываюсь о смысле жизни.", factor: 'openness', isReversed: false },
  { id: 6, question: "Я предпочитаю знакомое, а не новое.", factor: 'openness', isReversed: true },
  { id: 7, question: "Мне интересно изучать разные науки.", factor: 'openness', isReversed: false },
  { id: 8, question: "Мне скучно читать о сложных теориях.", factor: 'openness', isReversed: true },
  { id: 9, question: "Я люблю решать нестандартные задачи.", factor: 'openness', isReversed: false },
  { id: 10, question: "Я считаю важным придерживаться традиций.", factor: 'openness', isReversed: true },
  { id: 11, question: "Я открыт к новым взглядам.", factor: 'openness', isReversed: false },
  { id: 12, question: "Мне трудно менять свои убеждения.", factor: 'openness', isReversed: true },
  { id: 13, question: "Я легко погружаюсь в воображаемые миры.", factor: 'openness', isReversed: false },
  { id: 14, question: "Я редко фантазирую.", factor: 'openness', isReversed: true },
  { id: 15, question: "Мне нравится обсуждать философские вопросы.", factor: 'openness', isReversed: false },
  { id: 16, question: "Я не люблю абстрактные разговоры.", factor: 'openness', isReversed: true },
  { id: 17, question: "Я получаю удовольствие от экспериментов.", factor: 'openness', isReversed: false },
  { id: 18, question: "Я предпочитаю стабильность и однообразие.", factor: 'openness', isReversed: true },
  { id: 19, question: "Я чувствую особую связь с искусством.", factor: 'openness', isReversed: false },
  { id: 20, question: "Художественные произведения редко вызывают у меня интерес.", factor: 'openness', isReversed: true },
  { id: 21, question: "Я часто задумываюсь о будущем.", factor: 'openness', isReversed: false },
  { id: 22, question: "Я предпочитаю жить настоящим моментом.", factor: 'openness', isReversed: true },
  { id: 23, question: "Я люблю исследовать новые места.", factor: 'openness', isReversed: false },
  { id: 24, question: "Я предпочитаю знакомые маршруты и привычные занятия.", factor: 'openness', isReversed: true },

  // Фактор 2: Добросовестность (Conscientiousness) - вопросы 25-48
  { id: 25, question: "Я всегда довожу начатое дело до конца.", factor: 'conscientiousness', isReversed: false },
  { id: 26, question: "Мне бывает трудно завершить задачи.", factor: 'conscientiousness', isReversed: true },
  { id: 27, question: "Я люблю планировать заранее.", factor: 'conscientiousness', isReversed: false },
  { id: 28, question: "Я часто действую импульсивно.", factor: 'conscientiousness', isReversed: true },
  { id: 29, question: "Я чувствую ответственность за свою работу.", factor: 'conscientiousness', isReversed: false },
  { id: 30, question: "Я иногда откладываю дела на потом.", factor: 'conscientiousness', isReversed: true },
  { id: 31, question: "Я ставлю себе цели и стремлюсь к ним.", factor: 'conscientiousness', isReversed: false },
  { id: 32, question: "Я быстро теряю мотивацию.", factor: 'conscientiousness', isReversed: true },
  { id: 33, question: "Я осторожен в принятии решений.", factor: 'conscientiousness', isReversed: false },
  { id: 34, question: "Я иногда рискую без особых причин.", factor: 'conscientiousness', isReversed: true },
  { id: 35, question: "Я люблю порядок и системность.", factor: 'conscientiousness', isReversed: false },
  { id: 36, question: "Я могу работать в беспорядке.", factor: 'conscientiousness', isReversed: true },
  { id: 37, question: "Я привык придерживаться расписания.", factor: 'conscientiousness', isReversed: false },
  { id: 38, question: "Мне трудно следовать плану.", factor: 'conscientiousness', isReversed: true },
  { id: 39, question: "Я организованный человек.", factor: 'conscientiousness', isReversed: false },
  { id: 40, question: "Я часто забываю важные дела.", factor: 'conscientiousness', isReversed: true },
  { id: 41, question: "Я трудолюбив.", factor: 'conscientiousness', isReversed: false },
  { id: 42, question: "Я легко откладываю работу ради отдыха.", factor: 'conscientiousness', isReversed: true },
  { id: 43, question: "Я внимателен к мелочам.", factor: 'conscientiousness', isReversed: false },
  { id: 44, question: "Я могу упускать детали.", factor: 'conscientiousness', isReversed: true },
  { id: 45, question: "Я умею распределять время.", factor: 'conscientiousness', isReversed: false },
  { id: 46, question: "Я часто опаздываю.", factor: 'conscientiousness', isReversed: true },
  { id: 47, question: "Я настойчив в работе.", factor: 'conscientiousness', isReversed: false },
  { id: 48, question: "Я быстро сдаюсь, если что-то сложно.", factor: 'conscientiousness', isReversed: true },

  // Фактор 3: Экстраверсия (Extraversion) - вопросы 49-72
  { id: 49, question: "Я легко завожу новые знакомства.", factor: 'extraversion', isReversed: false },
  { id: 50, question: "Мне трудно общаться с незнакомыми людьми.", factor: 'extraversion', isReversed: true },
  { id: 51, question: "Я чувствую себя комфортно в больших компаниях.", factor: 'extraversion', isReversed: false },
  { id: 52, question: "Я предпочитаю одиночество.", factor: 'extraversion', isReversed: true },
  { id: 53, question: "Я люблю брать инициативу на себя.", factor: 'extraversion', isReversed: false },
  { id: 54, question: "Я избегаю лидерских ролей.", factor: 'extraversion', isReversed: true },
  { id: 55, question: "У меня много энергии.", factor: 'extraversion', isReversed: false },
  { id: 56, question: "Я быстро устаю от активности.", factor: 'extraversion', isReversed: true },
  { id: 57, question: "Я часто испытываю энтузиазм.", factor: 'extraversion', isReversed: false },
  { id: 58, question: "Я редко радуюсь мелочам.", factor: 'extraversion', isReversed: true },
  { id: 59, question: "Я люблю разговаривать.", factor: 'extraversion', isReversed: false },
  { id: 60, question: "Я предпочитаю молчать.", factor: 'extraversion', isReversed: true },
  { id: 61, question: "Я получаю удовольствие от общения.", factor: 'extraversion', isReversed: false },
  { id: 62, question: "Я устаю от разговоров.", factor: 'extraversion', isReversed: true },
  { id: 63, question: "Я люблю быть в центре внимания.", factor: 'extraversion', isReversed: false },
  { id: 64, question: "Мне некомфортно, когда на меня обращают внимание.", factor: 'extraversion', isReversed: true },
  { id: 65, question: "Я энергичен даже вечером.", factor: 'extraversion', isReversed: false },
  { id: 66, question: "Я часто чувствую упадок сил.", factor: 'extraversion', isReversed: true },
  { id: 67, question: "Я люблю шумные мероприятия.", factor: 'extraversion', isReversed: false },
  { id: 68, question: "Я предпочитаю тихую обстановку.", factor: 'extraversion', isReversed: true },
  { id: 69, question: "Я общительный человек.", factor: 'extraversion', isReversed: false },
  { id: 70, question: "Я замкнутый человек.", factor: 'extraversion', isReversed: true },
  { id: 71, question: "Я чувствую прилив сил в компании других людей.", factor: 'extraversion', isReversed: false },
  { id: 72, question: "Я чувствую усталость после общения.", factor: 'extraversion', isReversed: true },

  // Фактор 4: Доброжелательность (Agreeableness) - вопросы 73-94
  { id: 73, question: "Я доверяю людям.", factor: 'agreeableness', isReversed: false },
  { id: 74, question: "Людям нельзя доверять.", factor: 'agreeableness', isReversed: true },
  { id: 75, question: "Мне нравится помогать другим.", factor: 'agreeableness', isReversed: false },
  { id: 76, question: "Я редко думаю о нуждах других.", factor: 'agreeableness', isReversed: true },
  { id: 77, question: "Я стараюсь быть честным.", factor: 'agreeableness', isReversed: false },
  { id: 78, question: "Иногда я готов обмануть ради выгоды.", factor: 'agreeableness', isReversed: true },
  { id: 79, question: "Я предпочитаю компромиссы.", factor: 'agreeableness', isReversed: false },
  { id: 80, question: "Я настаиваю на своём любой ценой.", factor: 'agreeableness', isReversed: true },
  { id: 81, question: "Я умею сочувствовать.", factor: 'agreeableness', isReversed: false },
  { id: 82, question: "Я равнодушен к чужим переживаниям.", factor: 'agreeableness', isReversed: true },
  { id: 83, question: "Я стараюсь сотрудничать.", factor: 'agreeableness', isReversed: false },
  { id: 84, question: "Я люблю конкурировать.", factor: 'agreeableness', isReversed: true },
  { id: 85, question: "Я считаю себя добрым человеком.", factor: 'agreeableness', isReversed: false },
  { id: 86, question: "Я бываю жёстким и холодным.", factor: 'agreeableness', isReversed: true },
  { id: 87, question: "Я легко прощаю людей.", factor: 'agreeableness', isReversed: false },
  { id: 88, question: "Я долго держу обиды.", factor: 'agreeableness', isReversed: true },
  { id: 89, question: "Я считаю важным уважать других.", factor: 'agreeableness', isReversed: false },
  { id: 90, question: "Я часто думаю только о себе.", factor: 'agreeableness', isReversed: true },
  { id: 91, question: "Я получаю удовольствие, когда радую других.", factor: 'agreeableness', isReversed: false },
  { id: 92, question: "Мне безразлично, что чувствуют люди.", factor: 'agreeableness', isReversed: true },
  { id: 93, question: "Я считаю себя миролюбивым человеком.", factor: 'agreeableness', isReversed: false },
  { id: 94, question: "Я часто раздражаюсь на людей.", factor: 'agreeableness', isReversed: true },

  // Фактор 5: Нейротизм (Neuroticism) - вопросы 95-112
  { id: 95, question: "Я часто тревожусь без причины.", factor: 'neuroticism', isReversed: false },
  { id: 96, question: "Я редко переживаю.", factor: 'neuroticism', isReversed: true },
  { id: 97, question: "Я легко раздражаюсь.", factor: 'neuroticism', isReversed: false },
  { id: 98, question: "Я сохраняю спокойствие в любых ситуациях.", factor: 'neuroticism', isReversed: true },
  { id: 99, question: "В стрессовых ситуациях я теряюсь.", factor: 'neuroticism', isReversed: false },
  { id: 100, question: "Я умею держать себя в руках под давлением.", factor: 'neuroticism', isReversed: true },
  { id: 101, question: "Я часто сомневаюсь в себе.", factor: 'neuroticism', isReversed: false },
  { id: 102, question: "Я уверен в своих силах.", factor: 'neuroticism', isReversed: true },
  { id: 103, question: "Я могу действовать необдуманно.", factor: 'neuroticism', isReversed: false },
  { id: 104, question: "Я всегда контролирую свои поступки.", factor: 'neuroticism', isReversed: true },
  { id: 105, question: "Я чувствителен к критике.", factor: 'neuroticism', isReversed: false },
  { id: 106, question: "Замечания редко задевают меня.", factor: 'neuroticism', isReversed: true },
  { id: 107, question: "Я склонен к сильным эмоциональным перепадам.", factor: 'neuroticism', isReversed: false },
  { id: 108, question: "Я сохраняю эмоциональную стабильность.", factor: 'neuroticism', isReversed: true },
  { id: 109, question: "Я часто ощущаю внутреннее напряжение.", factor: 'neuroticism', isReversed: false },
  { id: 110, question: "Я редко чувствую стресс.", factor: 'neuroticism', isReversed: true },
  { id: 111, question: "Я беспокоюсь о будущем.", factor: 'neuroticism', isReversed: false },
  { id: 112, question: "Я смотрю в будущее спокойно.", factor: 'neuroticism', isReversed: true }
];

// Конфигурация теста
export const bigFiveTestConfig: BigFiveTestConfig = {
  id: 'big-five',
  title: 'Тест Big Five (112 вопросов)',
  description: 'Оцените свои черты личности по пятифакторной модели. Ответьте на все вопросы по шкале от 1 до 5.',
  icon: Brain,
  questions: bigFiveQuestions,
  factors: {
    openness: {
      name: 'Открытость опыту',
      icon: Brain,
      description: 'Любознательность, воображение, творчество, интерес к новому'
    },
    conscientiousness: {
      name: 'Добросовестность',
      icon: Target,
      description: 'Организованность, ответственность, самодисциплина, целеустремленность'
    },
    extraversion: {
      name: 'Экстраверсия',
      icon: Users,
      description: 'Общительность, энергичность, активность, оптимизм'
    },
    agreeableness: {
      name: 'Доброжелательность',
      icon: Heart,
      description: 'Доверие, сотрудничество, сочувствие, уступчивость'
    },
    neuroticism: {
      name: 'Нейротизм',
      icon: Zap,
      description: 'Тревожность, раздражительность, эмоциональная нестабильность'
    }
  }
};

// Функция для подсчета результатов
export function calculateBigFiveResults(answers: { [key: number]: number }): BigFiveResult[] {
  const factorScores: { [key: string]: number } = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0
  };

  // Подсчет баллов по каждому фактору
  bigFiveQuestions.forEach(question => {
    let score = answers[question.id] || 3; // По умолчанию нейтральный ответ
    
    // Инвертируем ответы для обратных вопросов
    if (question.isReversed) {
      score = 6 - score; // 1→5, 2→4, 3→3, 4→2, 5→1
    }
    
    factorScores[question.factor] += score;
  });

  // Максимальные баллы для каждого фактора
  const maxScores = {
    openness: 120,        // 24 вопроса × 5 баллов
    conscientiousness: 120, // 24 вопроса × 5 баллов
    extraversion: 120,    // 24 вопроса × 5 баллов
    agreeableness: 110,   // 22 вопроса × 5 баллов
    neuroticism: 90       // 18 вопросов × 5 баллов
  };

  // Формирование результатов
  return Object.entries(factorScores).map(([factor, score]) => {
    const maxScore = maxScores[factor as keyof typeof maxScores];
    const percentage = Math.round((score / maxScore) * 100);
    
    // Определение уровня выраженности
    let level: BigFiveResult['level'];
    if (percentage <= 20) level = 'very_low';
    else if (percentage <= 40) level = 'low';
    else if (percentage <= 60) level = 'average';
    else if (percentage <= 80) level = 'high';
    else level = 'very_high';

    return {
      factor,
      score,
      maxScore,
      percentage,
      level,
      description: getFactorDescription(factor, level),
      traits: getFactorTraits(factor, level)
    };
  });
}

// Функция для получения описания фактора
function getFactorDescription(factor: string, level: string): string {
  const descriptions = {
    openness: {
      very_low: 'Вы практичны и предпочитаете проверенные, надежные способы. Вам комфортнее придерживаться традиций и стабильного образа жизни.',
      low: 'Вы склонны к практичности и предпочитаете знакомые вещи новым.',
      average: 'У вас сбалансированный подход к новому опыту - вы открыты к изменениям, но не забываете о проверенных методах.',
      high: 'Вы любознательны и тянетесь к новому. У вас богатое воображение и стремление к творчеству.',
      very_high: 'Вы очень открыты к новому опыту, обладаете богатым воображением и сильным стремлением к творчеству и исследованиям.'
    },
    conscientiousness: {
      very_low: 'Вы склонны действовать спонтанно, предпочитаете гибкость и свободу вместо жесткого порядка.',
      low: 'Вам может быть трудно следовать планам и держать строгую дисциплину.',
      average: 'У вас умеренная организованность - вы можете планировать, но иногда предпочитаете гибкость.',
      high: 'Вы организованный и надежный человек. Умеете планировать, контролировать действия и доводить начатое до конца.',
      very_high: 'Вы очень организованны, дисциплинированны и ответственны. Всегда доводите дела до конца.'
    },
    extraversion: {
      very_low: 'Вы чувствуете себя комфортно наедине с собой. Вам важны внутренний мир и спокойная обстановка.',
      low: 'Вы предпочитаете глубокие, осмысленные контакты поверхностному общению.',
      average: 'У вас сбалансированная социальность - вы можете быть общительным, но также цените время наедине с собой.',
      high: 'Вы энергичны и общительны. Вам нравится быть среди людей и участвовать в разговорах.',
      very_high: 'Вы очень общительны и энергичны. Любите быть в центре внимания и заводить новые знакомства.'
    },
    agreeableness: {
      very_low: 'Вы более независимы и прямолинейны. Вам свойственна критичность и скептическое отношение к людям.',
      low: 'Вы можете быть прямым и даже жестким в суждениях, открыто отстаиваете свои интересы.',
      average: 'У вас умеренная доброжелательность - вы умеете сотрудничать, но также можете отстаивать свою позицию.',
      high: 'Вы отзывчивы, доверяете людям и умеете сочувствовать. Важно сотрудничество и гармония в отношениях.',
      very_high: 'Вы очень доброжелательны и отзывчивы. Всегда готовы помочь другим и найти компромиссы.'
    },
    neuroticism: {
      very_low: 'Вы эмоционально устойчивы, спокойны и уверены в себе. Даже в сложных обстоятельствах сохраняете хладнокровие.',
      low: 'Вы редко переживаете и тревожитесь. Умеете справляться со стрессом.',
      average: 'У вас умеренная эмоциональная чувствительность - вы можете переживать, но обычно справляетесь с эмоциями.',
      high: 'Вы склонны переживать и тревожиться. Вам может быть трудно сохранять спокойствие в стрессовых ситуациях.',
      very_high: 'Вы очень чувствительны к стрессу и критике. Эмоции могут сильно влиять на ваше состояние.'
    }
  };

  return descriptions[factor as keyof typeof descriptions]?.[level] || 'Описание недоступно';
}

// Функция для получения характерных черт
function getFactorTraits(factor: string, level: string): string[] {
  const traits = {
    openness: {
      very_low: ['Практичность', 'Традиционность', 'Реализм', 'Стабильность'],
      low: ['Консервативность', 'Практичность', 'Надежность'],
      average: ['Баланс', 'Адаптивность', 'Умеренность'],
      high: ['Любознательность', 'Творчество', 'Воображение', 'Открытость'],
      very_high: ['Инновационность', 'Творчество', 'Философичность', 'Экспериментальность']
    },
    conscientiousness: {
      very_low: ['Спонтанность', 'Гибкость', 'Импульсивность', 'Свобода'],
      low: ['Гибкость', 'Адаптивность', 'Спонтанность'],
      average: ['Умеренность', 'Баланс', 'Адаптивность'],
      high: ['Организованность', 'Ответственность', 'Целеустремленность', 'Дисциплина'],
      very_high: ['Перфекционизм', 'Системность', 'Надежность', 'Контроль']
    },
    extraversion: {
      very_low: ['Интроверсия', 'Задумчивость', 'Спокойствие', 'Глубина'],
      low: ['Сдержанность', 'Глубина', 'Осмысленность'],
      average: ['Баланс', 'Адаптивность', 'Умеренность'],
      high: ['Общительность', 'Энергичность', 'Инициативность', 'Оптимизм'],
      very_high: ['Доминантность', 'Энергичность', 'Общительность', 'Лидерство']
    },
    agreeableness: {
      very_low: ['Независимость', 'Прямолинейность', 'Критичность', 'Конкуренция'],
      low: ['Прямолинейность', 'Независимость', 'Решительность'],
      average: ['Баланс', 'Адаптивность', 'Умеренность'],
      high: ['Доброта', 'Доверие', 'Сотрудничество', 'Сочувствие'],
      very_high: ['Альтруизм', 'Миролюбие', 'Доброта', 'Поддержка']
    },
    neuroticism: {
      very_low: ['Эмоциональная стабильность', 'Спокойствие', 'Уверенность', 'Хладнокровие'],
      low: ['Стабильность', 'Спокойствие', 'Уверенность'],
      average: ['Умеренность', 'Баланс', 'Адаптивность'],
      high: ['Чувствительность', 'Тревожность', 'Эмоциональность', 'Реактивность'],
      very_high: ['Высокая чувствительность', 'Тревожность', 'Эмоциональная нестабильность', 'Стресс']
    }
  };

  return traits[factor as keyof typeof traits]?.[level] || [];
}
