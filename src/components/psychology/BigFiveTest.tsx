import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  bigFiveQuestions,
  bigFiveTestConfig,
  calculateBigFiveResults,
  BigFiveResult
} from '@/data/bigFiveTest';

interface BigFiveTestProps {
  onComplete: (results: BigFiveResult[]) => void;
}

export const BigFiveTest: React.FC<BigFiveTestProps> = ({ onComplete }) => {
  // Все хуки в начале компонента
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<BigFiveResult[]>([]);

  // Вычисляемые значения
  const totalQuestions = bigFiveQuestions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const currentQ = bigFiveQuestions[currentQuestion];
  const hasAnswer = answers[currentQ.id] !== undefined;

  // Функции
  const handleAnswer = (score: number) => {
    const questionId = bigFiveQuestions[currentQuestion].id;
    setAnswers(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishTest = () => {
    const calculatedResults = calculateBigFiveResults(answers);
    setResults(calculatedResults);
    setShowResults(true);
    onComplete(calculatedResults);
  };

  const restartTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setResults([]);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'very_low': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-orange-100 text-orange-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-green-100 text-green-800';
      case 'very_high': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'very_low': return 'Очень низкий';
      case 'low': return 'Низкий';
      case 'average': return 'Средний';
      case 'high': return 'Высокий';
      case 'very_high': return 'Очень высокий';
      default: return 'Неизвестно';
    }
  };

  const getHighLevelDescription = (factor: string) => {
    switch (factor) {
      case 'openness':
        return 'Вы открыты новому, любознательны и креативны. Вам нравится изучать разные идеи, культуры, науки и искусство. Вы легко фантазируете, цените красоту и нестандартные подходы. С Вами интересно обсуждать сложные темы — философские, абстрактные или творческие. Вы гибки в мышлении и умеете находить оригинальные решения.';
      case 'conscientiousness':
        return 'Вы организованы, дисциплинированы и ответственны. Вы умеете планировать и доводить дела до конца, серьёзно относитесь к обязанностям и обязательствам. Вас можно назвать человеком надёжным: окружающие знают, что Вы держите слово и умеете упорно работать.';
      case 'extraversion':
        return 'Вы энергичны, общительны и любите быть среди людей. Вам легко заводить новые знакомства, брать на себя инициативу и быть в центре внимания. Вы любите шумные компании, активные мероприятия и чувствуете прилив сил в общении. Вас можно назвать жизнерадостным и эмоционально открытым человеком.';
      case 'agreeableness':
        return 'Вы доверяете людям, умеете сочувствовать и стремитесь к гармоничным отношениям. Вам нравится помогать, поддерживать и находить компромиссы. Вы мягки, отзывчивы и стараетесь избегать конфликтов. Люди ценят в Вас доброту, честность и открытость.';
      case 'neuroticism':
        return 'Вы чувствительны, эмоциональны и склонны к тревожности. Вам может быть трудно справляться со стрессом, критикой и неопределённостью. Ваше настроение иногда быстро меняется, и Вы можете переживать даже без серьёзных причин. Вместе с тем это делает Вас внимательным к себе и своим чувствам.';
      default:
        return '';
    }
  };

  const getMediumLevelDescription = (factor: string) => {
    switch (factor) {
      case 'openness':
        return 'Вы умеете сочетать интерес к новому с практичностью. Иногда Вы с удовольствием пробуете новые идеи или формы деятельности, но не стремитесь к постоянным экспериментам. Вам комфортно и в мире традиций, и в мире новых открытий. Можно сказать, что Вы открыты к переменам, но относитесь к ним избирательно.';
      case 'conscientiousness':
        return 'Вы стараетесь быть организованным, но иногда допускаете гибкость или спонтанность. Вам важно завершать дела, но Вы можете позволить себе расслабиться или поменять планы. Вы совмещаете в себе дисциплину и свободу, умеете быть ответственным, но не чрезмерно жёстким.';
      case 'extraversion':
        return 'Вы комфортно чувствуете себя и среди людей, и наедине с собой. Иногда Вам хочется быть активным и общительным, а иногда — спокойно проводить время в тишине. Вы выбираете ситуации по настроению и умеете балансировать между социальной активностью и уединением.';
      case 'agreeableness':
        return 'Вы умеете быть доброжелательным, но не всегда идёте на уступки. Иногда Вы предпочитаете помочь и поддержать, а иногда — настоять на своём. Вы стараетесь быть честным и справедливым, но при этом способны защищать свои интересы и выражать критику.';
      case 'neuroticism':
        return 'Вы иногда переживаете и тревожитесь, но умеете сохранять равновесие. Вы чувствуете эмоции достаточно ярко, но в целом способны контролировать их. В стрессовых ситуациях Вы можете испытывать напряжение, но не теряете способность справляться с задачами.';
      default:
        return '';
    }
  };

  const getLowLevelDescription = (factor: string) => {
    switch (factor) {
      case 'openness':
        return 'Вы практичны, последовательны и цените проверенные решения. Вам комфортнее придерживаться знакомого и стабильного образа жизни. Вам могут быть менее интересны искусство, философские рассуждения или эксперименты, зато Вы умеете видеть конкретику и опираться на надёжные методы. Вы твёрдо стоите на земле и избегаете лишних рисков.';
      case 'conscientiousness':
        return 'Вы спонтанны и гибки, часто действуете по ситуации. Вам может быть трудно строго следовать планам или завершать задачи вовремя. Иногда Вы откладываете дела на потом или быстро теряете интерес к долгосрочным задачам. При этом Ваша особенность — способность быть творческим, лёгким на подъём и находить нестандартные пути.';
      case 'extraversion':
        return 'Вы предпочитаете спокойную обстановку и глубокие, а не поверхностные контакты. Вам комфортнее наедине с собой или с близкими людьми. Вы не любите быть в центре внимания, предпочитаете слушать больше, чем говорить. Вас отличает вдумчивость, наблюдательность и умение концентрироваться на внутреннем мире.';
      case 'agreeableness':
        return 'Вы более критичны и независимы. Вам свойственна прямота, конкуренция и скептическое отношение к другим. Вы открыто отстаиваете свои интересы и не всегда готовы идти на уступки. Вас можно воспринимать как строгого, но честного человека, который не боится говорить правду.';
      case 'neuroticism':
        return 'Вы спокойны, уверены в себе и эмоционально устойчивы. Даже в сложных обстоятельствах Вы сохраняете хладнокровие и не поддаётесь панике. Вас трудно вывести из равновесия, Вы умеете справляться со стрессом и смотрите на будущее с уверенностью.';
      default:
        return '';
    }
  };

  // Один return statement с условным рендерингом
  return (
    <>
      {showResults ? (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Результаты теста Big Five
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Ваш профиль личности по пятифакторной модели
              </p>
            </CardHeader>
          </Card>

          <div className="grid gap-6">
            {results.map((result) => (
              <Card key={result.factor}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {React.createElement(bigFiveTestConfig.factors[result.factor as keyof typeof bigFiveTestConfig.factors].icon, {
                          className: "w-5 h-5 text-primary"
                        })}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {bigFiveTestConfig.factors[result.factor as keyof typeof bigFiveTestConfig.factors].name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {bigFiveTestConfig.factors[result.factor as keyof typeof bigFiveTestConfig.factors].description}
                        </p>
                      </div>
                    </div>
                    <Badge className={getLevelColor(result.level)}>
                      {getLevelText(result.level)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Баллы: {result.score} / {result.maxScore}</span>
                      <span>{result.percentage}%</span>
                    </div>
                    <Progress value={result.percentage} className="h-2" />
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">📖 Интерпретация Big Five: высокий, средний и низкий уровень</h4>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
                        🔹 {bigFiveTestConfig.factors[result.factor as keyof typeof bigFiveTestConfig.factors].name}
                      </h5>
                      
                      <div className="space-y-4">
                        <div>
                          <h6 className="font-medium text-blue-700 dark:text-blue-400 text-sm">Высокий уровень</h6>
                          <p className="text-blue-600 dark:text-blue-300 text-sm leading-relaxed">
                            {result.level === 'high' || result.level === 'very_high' 
                              ? result.description 
                              : getHighLevelDescription(result.factor.toLowerCase())}
                          </p>
                        </div>
                        
                        <div>
                          <h6 className="font-medium text-blue-700 dark:text-blue-400 text-sm">Средний уровень</h6>
                          <p className="text-blue-600 dark:text-blue-300 text-sm leading-relaxed">
                            {result.level === 'average' 
                              ? result.description 
                              : getMediumLevelDescription(result.factor.toLowerCase())}
                          </p>
                        </div>
                        
                        <div>
                          <h6 className="font-medium text-blue-700 dark:text-blue-400 text-sm">Низкий уровень</h6>
                          <p className="text-blue-600 dark:text-blue-300 text-sm leading-relaxed">
                            {result.level === 'low' || result.level === 'very_low' 
                              ? result.description 
                              : getLowLevelDescription(result.factor.toLowerCase())}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Характерные черты:</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.traits.map((trait, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={restartTest} variant="outline" className="flex-1">
              Пройти тест заново
            </Button>
            <Button 
              variant="default" 
              onClick={() => {
                try {
                  // Формируем сообщение с результатом теста Big Five
                  const factorNames: Record<string, string> = {
                    'openness': 'Открытость к опыту',
                    'conscientiousness': 'Добросовестность',
                    'extraversion': 'Экстраверсия',
                    'agreeableness': 'Доброжелательность',
                    'neuroticism': 'Нейротизм'
                  };
                  
                  const levelNames: Record<string, string> = {
                    'very_low': 'Очень низкий',
                    'low': 'Низкий',
                    'average': 'Средний',
                    'high': 'Высокий',
                    'very_high': 'Очень высокий'
                  };
                  
                  const resultText = results.map(result => {
                    const factorName = factorNames[result.factor] || result.factor;
                    const levelName = levelNames[result.level] || result.level;
                    return `• **${factorName}:** ${result.score}/100 (${levelName})`;
                  }).join('\n');
                  
                  // Создаем полное сообщение для Протея
                  const fullMessage = `Привет, Протей! Я только что прошел тест Big Five и хочу обсудить результаты. Вот что получилось:\n\n# 🧠 Результаты теста Big Five\n\n## Пять факторов личности\n\n${resultText}\n\nМожешь помочь мне разобраться в результатах и дать рекомендации?`;
                  
                  // Сохраняем сообщение в localStorage для передачи в чат
                  localStorage.setItem('proteusChatMessage', fullMessage);
                  localStorage.setItem('proteusChatSource', 'bigfive-test');
                  localStorage.setItem('proteusChatTestId', 'bigFive');
                  
                  // Перенаправляем на страницу чата
                  window.location.href = '/chat';
                  
                } catch (error) {
                  console.error('Error preparing chat message:', error);
                  alert('Ошибка при подготовке сообщения для чата. Попробуйте еще раз.');
                }
              }}
              className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Поделиться
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                try {
                  // Формируем сообщение с результатом теста Big Five
                  const factorNames: Record<string, string> = {
                    'openness': 'Открытость к опыту',
                    'conscientiousness': 'Добросовестность',
                    'extraversion': 'Экстраверсия',
                    'agreeableness': 'Доброжелательность',
                    'neuroticism': 'Нейротизм'
                  };
                  
                  const levelNames: Record<string, string> = {
                    'very_low': 'Очень низкий',
                    'low': 'Низкий',
                    'average': 'Средний',
                    'high': 'Высокий',
                    'very_high': 'Очень высокий'
                  };
                  
                  const resultText = results.map(result => {
                    const factorName = factorNames[result.factor] || result.factor;
                    const levelName = levelNames[result.level] || result.level;
                    return `• **${factorName}:** ${result.score}/100 (${levelName})`;
                  }).join('\n');
                  
                  // Создаем полное сообщение для Протея
                  const fullMessage = `Привет, Протей! Я только что прошел тест Big Five и хочу обсудить результаты. Вот что получилось:\n\n# 🧠 Результаты теста Big Five\n\n## Пять факторов личности\n\n${resultText}\n\nМожешь помочь мне разобраться в результатах и дать рекомендации?`;
                  
                  // Сохраняем сообщение в localStorage для передачи в чат
                  localStorage.setItem('proteusChatMessage', fullMessage);
                  localStorage.setItem('proteusChatSource', 'bigfive-test');
                  localStorage.setItem('proteusChatTestId', 'bigFive');
                  
                  // Перенаправляем на страницу чата
                  window.location.href = '/chat';
                  
                } catch (error) {
                  console.error('Error preparing chat message:', error);
                  alert('Ошибка при подготовке сообщения для чата. Попробуйте еще раз.');
                }
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9l-1 1v-1H6a2 2 0 00-2 2v4a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2z" />
              </svg>
              Поговорить с Протеем
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {bigFiveTestConfig.title}
              </CardTitle>
              <p className="text-center text-muted-foreground">
                {bigFiveTestConfig.description}
              </p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Вопрос {currentQuestion + 1} из {totalQuestions}
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">{currentQ.question}</h3>
                <p className="text-sm text-muted-foreground">
                  Выберите ответ по шкале от 1 до 5
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  { score: 1, text: "Совершенно не согласен" },
                  { score: 2, text: "Не согласен" },
                  { score: 3, text: "Нейтрально" },
                  { score: 4, text: "Согласен" },
                  { score: 5, text: "Полностью согласен" }
                ].map((option) => (
                  <Button
                    key={option.score}
                    variant={answers[currentQ.id] === option.score ? "default" : "outline"}
                    className="justify-start h-auto p-4 text-left"
                    onClick={() => handleAnswer(option.score)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQ.id] === option.score 
                          ? "border-primary bg-primary text-primary-foreground" 
                          : "border-muted-foreground"
                      }`}>
                        {answers[currentQ.id] === option.score && (
                          <div className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>
                      <span className="font-medium">{option.score}.</span>
                      <span>{option.text}</span>
                    </div>
                  </Button>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between">
                <Button
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                  variant="outline"
                >
                  Назад
                </Button>
                
                {currentQuestion === totalQuestions - 1 ? (
                  <Button
                    onClick={finishTest}
                    disabled={!hasAnswer}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Завершить тест
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    disabled={!hasAnswer}
                  >
                    Следующий вопрос
                  </Button>
                )}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Отвечено: {Object.keys(answers).length} из {totalQuestions}</p>
                {currentQ.isReversed && (
                  <p className="text-orange-600 font-medium">
                    ⚠️ Обратный вопрос - будьте внимательны при ответе
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};