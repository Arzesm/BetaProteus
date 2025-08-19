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

// MBTI Test (полный тест с 92 вопросами)
export const mbtiTest: TestConfig = {
  id: 'mbti',
  title: 'Тест MBTI',
  description: 'Определите ваш тип личности по методике Майерс-Бриггс (92 вопроса)',
  icon: Layers,
  questions: [
    // I. Экстраверсия (E) — Интроверсия (I) - вопросы 1-23
    {
      question: "Когда вы на вечеринке, вы чаще:",
      options: [
        { text: "A) заводите новые знакомства", score: 1 }, // E
        { text: "B) держитесь ближе к знакомым людям", score: 0 } // I
      ]
    },
    {
      question: "После насыщенного дня вы предпочитаете:",
      options: [
        { text: "A) пообщаться с кем-то, обсудить события", score: 1 }, // E
        { text: "B) побыть в тишине, восстановить силы", score: 0 } // I
      ]
    },
    {
      question: "В работе над проектом вы:",
      options: [
        { text: "A) предпочитаете обсуждать идеи вслух", score: 1 }, // E
        { text: "B) обдумываете всё самостоятельно", score: 0 } // I
      ]
    },
    {
      question: "В очереди вы:",
      options: [
        { text: "A) легко вступите в разговор с соседями", score: 1 }, // E
        { text: "B) тихо ждёте своей очереди", score: 0 } // I
      ]
    },
    {
      question: "Когда вам нужно что-то понять, вы:",
      options: [
        { text: "A) говорите, чтобы прояснить мысли", score: 1 }, // E
        { text: "B) обдумываете в голове, а потом говорите", score: 0 } // I
      ]
    },
    {
      question: "В незнакомом месте вы:",
      options: [
        { text: "A) первым делом ищете, с кем поговорить", score: 1 }, // E
        { text: "B) сначала наблюдаете и присматриваетесь", score: 0 } // I
      ]
    },
    {
      question: "Когда вам скучно, вы:",
      options: [
        { text: "A) ищете компанию", score: 1 }, // E
        { text: "B) находите занятие наедине с собой", score: 0 } // I
      ]
    },
    {
      question: "На собраниях вы:",
      options: [
        { text: "A) активно участвуете в обсуждении", score: 1 }, // E
        { text: "B) предпочитаете слушать", score: 0 } // I
      ]
    },
    {
      question: "Если нужно принять решение, вы:",
      options: [
        { text: "A) советуетесь с другими", score: 1 }, // E
        { text: "B) размышляете в одиночку", score: 0 } // I
      ]
    },
    {
      question: "В отпуске вам нравится:",
      options: [
        { text: "A) много общения и активности", score: 1 }, // E
        { text: "B) тихий отдых и личное время", score: 0 } // I
      ]
    },
    {
      question: "Когда вы встречаете старых знакомых, вы:",
      options: [
        { text: "A) рады и оживлённо беседуете", score: 1 }, // E
        { text: "B) обмениваетесь парой фраз", score: 0 } // I
      ]
    },
    {
      question: "При встрече с новыми людьми вы:",
      options: [
        { text: "A) легко начинаете разговор", score: 1 }, // E
        { text: "B) ждёте, когда заговорят с вами", score: 0 } // I
      ]
    },
    {
      question: "На мероприятии вы:",
      options: [
        { text: "A) ходите между группами людей", score: 1 }, // E
        { text: "B) остаетесь в одной компании", score: 0 } // I
      ]
    },
    {
      question: "Когда у вас проблема, вы:",
      options: [
        { text: "A) рассказываете о ней другим", score: 1 }, // E
        { text: "B) обдумываете, прежде чем делиться", score: 0 } // I
      ]
    },
    {
      question: "Если вы долго одни, вы:",
      options: [
        { text: "A) ищете общения", score: 1 }, // E
        { text: "B) наслаждаетесь временем для себя", score: 0 } // I
      ]
    },
    {
      question: "На встречах с друзьями вы:",
      options: [
        { text: "A) рассказываете о новостях", score: 1 }, // E
        { text: "B) слушаете больше, чем говорите", score: 0 } // I
      ]
    },
    {
      question: "На работе вам нравится:",
      options: [
        { text: "A) командная работа", score: 1 }, // E
        { text: "B) индивидуальные задачи", score: 0 } // I
      ]
    },
    {
      question: "Когда звонит телефон, вы:",
      options: [
        { text: "A) берёте трубку без колебаний", score: 1 }, // E
        { text: "B) иногда откладываете ответ", score: 0 } // I
      ]
    },
    {
      question: "На курсе/тренинге вы:",
      options: [
        { text: "A) задаёте много вопросов", score: 1 }, // E
        { text: "B) записываете и разбираете потом", score: 0 } // I
      ]
    },
    {
      question: "Если нужно познакомиться с кем-то, вы:",
      options: [
        { text: "A) идёте на контакт сами", score: 1 }, // E
        { text: "B) ждёте подходящего момента", score: 0 } // I
      ]
    },
    {
      question: "На семейных встречах вы:",
      options: [
        { text: "A) в центре событий", score: 1 }, // E
        { text: "B) в стороне, но наблюдаете", score: 0 } // I
      ]
    },
    {
      question: "В группе вы:",
      options: [
        { text: "A) говорите больше среднего", score: 1 }, // E
        { text: "B) говорите меньше среднего", score: 0 } // I
      ]
    },
    {
      question: "После длительного общения вы чувствуете:",
      options: [
        { text: "A) прилив энергии", score: 1 }, // E
        { text: "B) усталость", score: 0 } // I
      ]
    },
    // II. Сенсорика (S) — Интуиция (N) - вопросы 24-46
    {
      question: "При изучении нового вы:",
      options: [
        { text: "A) полагаетесь на факты и опыт", score: 1 }, // S
        { text: "B) ищете скрытые связи и возможности", score: 0 } // N
      ]
    },
    {
      question: "Если даёте инструкцию, вы:",
      options: [
        { text: "A) описываете конкретные шаги", score: 1 }, // S
        { text: "B) говорите об общей идее", score: 0 } // N
      ]
    },
    {
      question: "Вы предпочитаете:",
      options: [
        { text: "A) проверенные методы", score: 1 }, // S
        { text: "B) новые подходы", score: 0 } // N
      ]
    },
    {
      question: "Когда смотрите фильм, вам больше интересно:",
      options: [
        { text: "A) детали и реалистичность", score: 1 }, // S
        { text: "B) символы и идеи", score: 0 } // N
      ]
    },
    {
      question: "При решении проблемы вы:",
      options: [
        { text: "A) обращаетесь к прошлому опыту", score: 1 }, // S
        { text: "B) придумываете необычные варианты", score: 0 } // N
      ]
    },
    {
      question: "Вы лучше запоминаете:",
      options: [
        { text: "A) конкретные факты", score: 1 }, // S
        { text: "B) общую суть", score: 0 } // N
      ]
    },
    {
      question: "Когда вы готовите блюдо:",
      options: [
        { text: "A) строго следуете рецепту", score: 1 }, // S
        { text: "B) экспериментируете", score: 0 } // N
      ]
    },
    {
      question: "При планировании поездки:",
      options: [
        { text: "A) уточняете даты, места, детали", score: 1 }, // S
        { text: "B) думаете о впечатлениях и целях", score: 0 } // N
      ]
    },
    {
      question: "Когда читаете книгу:",
      options: [
        { text: "A) обращаете внимание на описание", score: 1 }, // S
        { text: "B) ищете скрытый смысл", score: 0 } // N
      ]
    },
    {
      question: "На работе вам комфортнее:",
      options: [
        { text: "A) выполнять чёткие задачи", score: 1 }, // S
        { text: "B) искать новые возможности", score: 0 } // N
      ]
    },
    {
      question: "При выборе подарка:",
      options: [
        { text: "A) ориентируетесь на практичность", score: 1 }, // S
        { text: "B) на эмоции и символику", score: 0 } // N
      ]
    },
    {
      question: "Вы больше доверяете:",
      options: [
        { text: "A) проверенным фактам", score: 1 }, // S
        { text: "B) вдохновению", score: 0 } // N
      ]
    },
    {
      question: "При разговоре о будущем:",
      options: [
        { text: "A) обсуждаете конкретные планы", score: 1 }, // S
        { text: "B) мечтаете о возможностях", score: 0 } // N
      ]
    },
    {
      question: "Если что-то работает, вы:",
      options: [
        { text: "A) не меняете без причины", score: 1 }, // S
        { text: "B) ищете, как улучшить", score: 0 } // N
      ]
    },
    {
      question: "Когда что-то учите:",
      options: [
        { text: "A) запоминаете шаги и детали", score: 1 }, // S
        { text: "B) связываете с общими идеями", score: 0 } // N
      ]
    },
    {
      question: "При выборе маршрута:",
      options: [
        { text: "A) идёте по привычному пути", score: 1 }, // S
        { text: "B) пробуете новый", score: 0 } // N
      ]
    },
    {
      question: "Когда ремонтируете что-то:",
      options: [
        { text: "A) используете инструкции", score: 1 }, // S
        { text: "B) импровизируете", score: 0 } // N
      ]
    },
    {
      question: "В истории вам интереснее:",
      options: [
        { text: "A) даты и события", score: 1 }, // S
        { text: "B) тенденции и причины", score: 0 } // N
      ]
    },
    {
      question: "Если рассказываете случай:",
      options: [
        { text: "A) приводите детали", score: 1 }, // S
        { text: "B) говорите кратко, передавая смысл", score: 0 } // N
      ]
    },
    {
      question: "Вы больше цените:",
      options: [
        { text: "A) надёжность и стабильность", score: 1 }, // S
        { text: "B) перспективу и новизну", score: 0 } // N
      ]
    },
    {
      question: "В искусстве вам важнее:",
      options: [
        { text: "A) реализм", score: 1 }, // S
        { text: "B) идея", score: 0 } // N
      ]
    },
    {
      question: "Если что-то работает, вы:",
      options: [
        { text: "A) довольны, что так и есть", score: 1 }, // S
        { text: "B) думаете, как можно улучшить", score: 0 } // N
      ]
    },
    {
      question: "В планах вам важнее:",
      options: [
        { text: "A) что и когда будет сделано", score: 1 }, // S
        { text: "B) к чему это приведёт", score: 0 } // N
      ]
    },
    // III. Мышление (T) — Чувствование (F) - вопросы 47-69
    {
      question: "При принятии решений вы больше учитываете:",
      options: [
        { text: "A) логику и факты", score: 1 }, // T
        { text: "B) чувства и отношения", score: 0 } // F
      ]
    },
    {
      question: "Когда спорите:",
      options: [
        { text: "A) придерживаетесь фактов", score: 1 }, // T
        { text: "B) стараетесь сохранить гармонию", score: 0 } // F
      ]
    },
    {
      question: "Если друг просит совет:",
      options: [
        { text: "A) говорите, что рационально", score: 1 }, // T
        { text: "B) учитываете его чувства", score: 0 } // F
      ]
    },
    {
      question: "В рабочей ситуации вам важнее:",
      options: [
        { text: "A) результат", score: 1 }, // T
        { text: "B) атмосфера", score: 0 } // F
      ]
    },
    {
      question: "Когда даёте обратную связь:",
      options: [
        { text: "A) прямо указываете на ошибки", score: 1 }, // T
        { text: "B) смягчаете слова, чтобы не задеть", score: 0 } // F
      ]
    },
    {
      question: "В конфликте вы:",
      options: [
        { text: "A) отстаиваете свою позицию", score: 1 }, // T
        { text: "B) ищете компромисс", score: 0 } // F
      ]
    },
    {
      question: "При оценке идеи вы:",
      options: [
        { text: "A) проверяете логику", score: 1 }, // T
        { text: "B) думаете, как это повлияет на людей", score: 0 } // F
      ]
    },
    {
      question: "В дискуссии вы:",
      options: [
        { text: "A) настаиваете на фактах", score: 1 }, // T
        { text: "B) ищете согласие", score: 0 } // F
      ]
    },
    {
      question: "В команде вы:",
      options: [
        { text: "A) фокусируетесь на цели", score: 1 }, // T
        { text: "B) на том, чтобы всем было комфортно", score: 0 } // F
      ]
    },
    {
      question: "Если коллега не справляется:",
      options: [
        { text: "A) говорите прямо о проблеме", score: 1 }, // T
        { text: "B) предлагаете поддержку", score: 0 } // F
      ]
    },
    {
      question: "Когда даёте оценку:",
      options: [
        { text: "A) объективно", score: 1 }, // T
        { text: "B) субъективно, с учётом эмоций", score: 0 } // F
      ]
    },
    {
      question: "Вы считаете, что правда:",
      options: [
        { text: "A) важнее чувств", score: 1 }, // T
        { text: "B) не всегда стоит говорить всё", score: 0 } // F
      ]
    },
    {
      question: "Если нужно выбрать решение:",
      options: [
        { text: "A) выбираете самое эффективное", score: 1 }, // T
        { text: "B) самое гуманное", score: 0 } // F
      ]
    },
    {
      question: "Когда вы обсуждаете политику:",
      options: [
        { text: "A) опираетесь на факты", score: 1 }, // T
        { text: "B) думаете о последствиях для людей", score: 0 } // F
      ]
    },
    {
      question: "При планировании:",
      options: [
        { text: "A) логично раскладываете шаги", score: 1 }, // T
        { text: "B) учитываете моральные аспекты", score: 0 } // F
      ]
    },
    {
      question: "Если кто-то вас критикует:",
      options: [
        { text: "A) воспринимаете как информацию", score: 1 }, // T
        { text: "B) принимаете близко к сердцу", score: 0 } // F
      ]
    },
    {
      question: "В выборе подарка:",
      options: [
        { text: "A) ориентируетесь на пользу", score: 1 }, // T
        { text: "B) на эмоции", score: 0 } // F
      ]
    },
    {
      question: "Когда что-то идёт не так:",
      options: [
        { text: "A) ищете рациональное объяснение", score: 1 }, // T
        { text: "B) думаете о чувствах участников", score: 0 } // F
      ]
    },
    {
      question: "Если сотрудник опоздал:",
      options: [
        { text: "A) напомните о правилах", score: 1 }, // T
        { text: "B) выясните причину", score: 0 } // F
      ]
    },
    {
      question: "В споре:",
      options: [
        { text: "A) держитесь логики", score: 1 }, // T
        { text: "B) учитываете эмоции", score: 0 } // F
      ]
    },
    {
      question: "При выборе работы:",
      options: [
        { text: "A) важнее условия и задачи", score: 1 }, // T
        { text: "B) важнее коллектив", score: 0 } // F
      ]
    },
    {
      question: "Если что-то нужно изменить:",
      options: [
        { text: "A) делаете по логике", score: 1 }, // T
        { text: "B) по эмоциональным соображениям", score: 0 } // F
      ]
    },
    {
      question: "Когда даёте советы:",
      options: [
        { text: "A) исходите из объективных данных", score: 1 }, // T
        { text: "B) из эмоционального понимания", score: 0 } // F
      ]
    },
    // IV. Суждение (J) — Восприятие (P) - вопросы 70-92
    {
      question: "При планировании дня:",
      options: [
        { text: "A) заранее составляете расписание", score: 1 }, // J
        { text: "B) действуете по обстоятельствам", score: 0 } // P
      ]
    },
    {
      question: "Перед поездкой:",
      options: [
        { text: "A) заранее всё бронируете", score: 1 }, // J
        { text: "B) решаете по ходу", score: 0 } // P
      ]
    },
    {
      question: "Если дедлайн через неделю:",
      options: [
        { text: "A) начинаете сразу", score: 1 }, // J
        { text: "B) откладываете до последнего", score: 0 } // P
      ]
    },
    {
      question: "Вам комфортнее, когда:",
      options: [
        { text: "A) всё определено", score: 1 }, // J
        { text: "B) есть свобода выбора", score: 0 } // P
      ]
    },
    {
      question: "Если план меняется:",
      options: [
        { text: "A) раздражает", score: 1 }, // J
        { text: "B) воспринимаете нормально", score: 0 } // P
      ]
    },
    {
      question: "Когда работаете:",
      options: [
        { text: "A) следуете плану", score: 1 }, // J
        { text: "B) импровизируете", score: 0 } // P
      ]
    },
    {
      question: "При уборке:",
      options: [
        { text: "A) делаете по расписанию", score: 1 }, // J
        { text: "B) по настроению", score: 0 } // P
      ]
    },
    {
      question: "Если встреча переносится:",
      options: [
        { text: "A) это неудобно", score: 1 }, // J
        { text: "B) лишнее время — приятно", score: 0 } // P
      ]
    },
    {
      question: "Когда делаете покупки:",
      options: [
        { text: "A) по списку", score: 1 }, // J
        { text: "B) что понравится", score: 0 } // P
      ]
    },
    {
      question: "Если проект долгий:",
      options: [
        { text: "A) делите на этапы", score: 1 }, // J
        { text: "B) делаете, как идёт", score: 0 } // P
      ]
    },
    {
      question: "В поездке вам нравится:",
      options: [
        { text: "A) план по дням", score: 1 }, // J
        { text: "B) спонтанность", score: 0 } // P
      ]
    },
    {
      question: "При выборе ресторана:",
      options: [
        { text: "A) заранее решаете", score: 1 }, // J
        { text: "B) на месте выбираете", score: 0 } // P
      ]
    },
    {
      question: "Если вам дают задание:",
      options: [
        { text: "A) хотите знать срок", score: 1 }, // J
        { text: "B) срок не важен", score: 0 } // P
      ]
    },
    {
      question: "При чтении книги:",
      options: [
        { text: "A) дочитываете до конца", score: 1 }, // J
        { text: "B) бросаете, если неинтересно", score: 0 } // P
      ]
    },
    {
      question: "Если остался час до встречи:",
      options: [
        { text: "A) ждёте, занимаясь мелочами", score: 1 }, // J
        { text: "B) можете начать что-то новое", score: 0 } // P
      ]
    },
    {
      question: "При планировании недели:",
      options: [
        { text: "A) распределяете задачи", score: 1 }, // J
        { text: "B) оставляете пространство для сюрпризов", score: 0 } // P
      ]
    },
    {
      question: "Если хотите что-то попробовать:",
      options: [
        { text: "A) готовитесь заранее", score: 1 }, // J
        { text: "B) пробуете сразу", score: 0 } // P
      ]
    },
    {
      question: "В выходные:",
      options: [
        { text: "A) заранее планируете", score: 1 }, // J
        { text: "B) решаете в момент", score: 0 } // P
      ]
    },
    {
      question: "Когда готовите:",
      options: [
        { text: "A) по рецепту", score: 1 }, // J
        { text: "B) на глаз", score: 0 } // P
      ]
    },
    {
      question: "Если возникает идея:",
      options: [
        { text: "A) встраиваете её в план", score: 1 }, // J
        { text: "B) пробуете немедленно", score: 0 } // P
      ]
    },
    {
      question: "Когда работаете в группе:",
      options: [
        { text: "A) придерживаетесь договорённостей", score: 1 }, // J
        { text: "B) меняете план, если надо", score: 0 } // P
      ]
    },
    {
      question: "При сборе чемодана:",
      options: [
        { text: "A) за день до отъезда", score: 1 }, // J
        { text: "B) в последний момент", score: 0 } // P
      ]
    },
    {
      question: "Если хотите посмотреть фильм:",
      options: [
        { text: "A) выбираете заранее", score: 1 }, // J
        { text: "B) решаете на месте", score: 0 } // P
      ]
    }
  ],
  results: [
    {
      min: 0,
      max: 92,
      title: "MBTI Тип",
      description: "Ваш тип личности по методике Майерс-Бриггс"
    }
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

// Archetype Test - теперь использует новый компонент
export const archetypeTest: TestConfig = {
  id: 'archetypes',
  title: 'Тест на архетипы (85 вопросов)',
  description: 'Определите свои доминирующие психологические архетипы по 12 основным типам',
  icon: Crown,
  questions: [
    {
      question: "Тест на архетипы включает 85 вопросов для определения 12 основных архетипов личности",
      options: [
        { text: "Начать тест", score: 0 }
      ]
    }
  ],
  results: [
    {
      min: 0,
      max: 100,
      title: "Архетипический профиль",
      description: "Ваш уникальный профиль из 12 архетипов с детальной интерпретацией"
    }
  ]
};

// Stress Test
export const stressTest: TestConfig = {
  id: 'stress',
  title: 'Тест на определение уровня стресса',
  description: 'Авторский тест из 40 вопросов для оценки уровня стресса и эмоционального состояния',
  icon: Activity,
  questions: [
    {
      question: "Тест на стресс включает 40 вопросов для определения уровня стресса по 4 категориям",
      options: [
        { text: "Начать тест", score: 0 }
      ]
    }
  ],
  results: [
    {
      min: 0,
      max: 160,
      title: "Уровень стресса",
      description: "Ваш уровень стресса с подробной интерпретацией и рекомендациями"
    }
  ]
};

export const allTests = [mbtiTest, bigFiveTest, archetypeTest, stressTest];