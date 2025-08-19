import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Layers, Activity, Crown, Brain } from "lucide-react";
import { MBTITest } from "@/components/psychology/MBTITest";
import { StressTest } from "@/components/psychology/StressTest";
import { BigFiveTest } from "@/components/psychology/BigFiveTest";
import { ArchetypeTest } from "@/components/psychology/ArchetypeTest";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { pageAnimation, cardAnimation, cardHover } from "@/lib/animations";

type MbtiScores = { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number };

const PsychologyPage = () => {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, string | { type: string; scores: MbtiScores }>>(() => {
    try {
      const savedResults = localStorage.getItem('psychologyTestResults');
      return savedResults ? JSON.parse(savedResults) : {};
    } catch (error) {
      console.error("Ошибка чтения результатов тестов из localStorage", error);
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('psychologyTestResults', JSON.stringify(testResults));
    } catch (error) {
      console.error("Ошибка сохранения результатов тестов в localStorage", error);
    }
  }, [testResults]);

  const tests = [
    {
      id: 'mbti',
      title: 'Тест MBTI',
      description: 'Определите ваш тип личности',
      longDescription: 'MBTI — индикатор типа Майерс–Бриггс с 92 вопросами. Он помогает понять, как вы черпаете энергию (E/I), обрабатываете информацию (S/N), принимаете решения (T/F) и структурируете жизнь (J/P). Тест не оценивает «хорошо/плохо», а описывает предпочтения и сильные стороны.',
      icon: Layers,
      component: MBTITest,
      color: 'text-purple-500'
    },
    {
      id: 'big-five',
      title: 'Тест Big Five',
      description: 'Пятифакторная модель личности',
      longDescription: 'Big Five оценивает пять устойчивых факторов: Открытость опыту, Добросовестность, Экстраверсию, Доброжелательность и Нейротизм. По сочетанию уровней формируется индивидуальный профиль с рекомендациями по работе, отношениям и саморазвитию.',
      icon: Activity,
      component: BigFiveTest,
      color: 'text-blue-500'
    },
    {
      id: 'archetypes',
      title: 'Тест на архетипы',
      description: 'Определите свои доминирующие архетипы',
      longDescription: 'Архетипы отражают глубинные модели поведения и мотивации (например, Герой, Мудрец, Опекун). Понимание доминирующих архетипов помогает выстраивать стратегии развития, стиль лидерства и коммуникации.',
      icon: Crown,
      component: ArchetypeTest,
      color: 'text-amber-500'
    },
    {
      id: 'stress',
      title: 'Тест на стресс',
      description: 'Оцените ваш уровень стресса',
      longDescription: 'Краткий скрининг текущего уровня стресса по поведенческим и физиологическим маркерам. Не является медицинской диагностикой, но помогает оценить необходимость отдыха и профилактик.',
      icon: Brain,
      component: StressTest,
      color: 'text-red-500'
    }
  ];

  const handleStartTest = (testId: string) => {
    setActiveTest(testId);
  };

  const handleTestComplete = (testId: string, result: string | { type: string; scores: MbtiScores }) => {
    if (testId === 'mbti' && typeof result === 'object' && 'type' in result) {
      // Для MBTI сохраняем полный результат с оценками
      setTestResults(prev => ({
        ...prev,
        [testId]: { type: result.type, scores: result.scores }
      }));
    } else {
      // Для других тестов сохраняем как есть
      setTestResults(prev => ({
        ...prev,
        [testId]: result as string
      }));
    }
    setActiveTest(null);
  };

  const getStatus = (testId: string) => {
    if (activeTest === testId) {
      return { 
        icon: '🕓', 
        text: 'В процессе', 
        className: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
        time: '10-20 мин'
      };
    }
    if (testResults[testId]) {
      return { 
        icon: '✅', 
        text: 'Пройден', 
        className: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
        time: '10-20 мин'
      };
    }
    return { 
      icon: '⬜', 
      text: 'Не пройден', 
      className: 'text-gray-600 bg-gray-100 dark:bg-gray-700/30 dark:text-gray-400',
      time: '10-20 мин'
    };
  };

  return (
    <motion.div
      variants={pageAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          Психологические тесты
        </h1>
        <p className="text-muted-foreground mt-2">
          Пройдите тесты для глубокого понимания своей личности
        </p>
      </div>

      <div className="space-y-6">
        {tests.map((test, index) => {
          const status = getStatus(test.id);
          return (
            <motion.div
              key={test.id}
              variants={cardAnimation}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={cardHover}
            >
              <div className="border rounded-xl overflow-hidden">
                <Accordion 
                  type="single" 
                  collapsible
                >
                  <AccordionItem value={test.id} className="border-b-0">
                    <AccordionTrigger 
                      className="hover:no-underline px-6 py-4"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-4">
                          <test.icon className={`h-6 w-6 ${test.color}`} />
                          <div className="text-left">
                            <h3 className="text-lg font-semibold">{test.title}</h3>
                            <p className="text-sm text-muted-foreground">{test.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${status.className}`}>
                            <span className="mr-1.5">{status.icon}</span>
                            <span>{status.text}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{status.time}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
                      <div className="relative bg-muted/40 dark:bg-muted/10 border border-border/60 rounded-xl p-5">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-muted-foreground/40 to-transparent rounded-t-xl" />
                        <h4 className="text-base font-semibold mb-2">О тесте</h4>
                        <p className="text-sm text-muted-foreground">{(test as any).longDescription || test.description}. Пройдите тест, отвечая интуитивно — это поможет точнее отразить ваш профиль.</p>
                      </div>

                      {activeTest === test.id ? (
                        <test.component 
                          onComplete={(result: string | { type: string; scores: MbtiScores }) => handleTestComplete(test.id, result)}
                        />
                      ) : testResults[test.id] ? (
                        <div className="relative bg-gradient-to-br from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-900/10 border border-border/60 rounded-xl p-5">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-t-xl" />
                          <h4 className="text-lg font-semibold mb-3">Ваш результат</h4>
                          {test.id === 'mbti' ? (
                            (() => {
                              const result = testResults[test.id];
                              if (typeof result === 'object' && result !== null && 'type' in result) {
                                // У нас есть полный результат с оценками
                                return (
                                  <MBTITest onComplete={() => {}} forceResult={{ type: result.type, scores: result.scores }} />
                                );
                              } else if (typeof result === 'string') {
                                // Старый формат - извлекаем тип из строки
                                const match = result.match(/\((E|I)(S|N)(T|F)(J|P)\)/);
                                const typeFromTitle = match ? match[0].replace(/[()]/g, '') : undefined;
                                return (
                                  <MBTITest onComplete={() => {}} forceResult={{ type: typeFromTitle || '' }} />
                                );
                              }
                              return null;
                            })()
                          ) : (
                          <div 
                            className="prose prose-sm max-w-none dark:prose-invert text-foreground"
                            dangerouslySetInnerHTML={{
                              __html: (testResults[test.id] as string)
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\n/g, '<br/>')
                            }}
                          />
                          )}
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => handleStartTest(test.id)}
                          >
                            Пройти заново
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="outline"
                          onClick={() => handleStartTest(test.id)}
                        >
                          Начать тест
                        </Button>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  );
};

export default PsychologyPage;