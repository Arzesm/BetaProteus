import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { stressQuestions, stressTestConfig, calculateStressResults, StressResult } from '@/data/stressTest';

const pageAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const cardAnimation = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 }
};

const cardHover = {
  hover: { scale: 1.02, transition: { duration: 0.2 } }
};

const StressTest: React.FC<{ onComplete: (result: StressResult) => void }> = ({ onComplete }) => {
  const navigate = useNavigate();
  // Все хуки в начале компонента
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<StressResult | null>(null);

  // Функции
  const getCurrentQuestion = () => stressQuestions.find(q => q.id === currentQuestion);

  // Вычисляемые значения
  const totalQuestions = stressQuestions.length;
  const progress = (currentQuestion / totalQuestions) * 100;
  const currentQuestionData = getCurrentQuestion();

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: value }));
    
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    const calculatedResults = calculateStressResults(answers);
    setResults(calculatedResults);
    setShowResults(true);
    onComplete(calculatedResults);
  };

  const resetTest = () => {
    setCurrentQuestion(1);
    setAnswers({});
    setShowResults(false);
    setResults(null);
  };

  const getAnswerLabel = (value: number) => {
    switch (value) {
      case 0: return 'Никогда';
      case 1: return 'Редко';
      case 2: return 'Иногда';
      case 3: return 'Часто';
      case 4: return 'Почти всегда';
      default: return '';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'very_high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getLevelTextColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-800';
      case 'moderate': return 'text-yellow-800';
      case 'high': return 'text-orange-800';
      case 'very_high': return 'text-red-800';
      default: return 'text-gray-800';
    }
  };

  // Проверка на существование данных вопроса
  if (!currentQuestionData) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-red-600">Ошибка: вопрос не найден</p>
      </div>
    );
  }

  // Один return statement с условным рендерингом
  return (
    <>
      {showResults && results ? (
        <motion.div
          variants={pageAnimation}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto p-6 space-y-6"
        >
          <Card className="border-4 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-blue-800">
                🧠 Результаты теста на стресс
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Основной результат */}
              <div className="text-center space-y-4">
                <div className={`inline-flex items-center px-6 py-3 rounded-full text-xl font-bold shadow-lg ${
                  getLevelColor(results.level)
                } text-white`}>
                  {results.levelName}
                </div>
                
                <div className="text-2xl font-bold text-gray-800">
                  {results.score} / {results.maxScore} баллов
                </div>
                
                <div className="text-lg text-gray-600">
                  {results.percentage}% от максимального значения
                </div>
                
                <Progress value={results.percentage} className="h-3" />
              </div>

              {/* Подробное описание */}
              <div className="bg-white rounded-lg p-6 border-l-4 border-blue-500 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  📋 Подробная интерпретация
                </h3>
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="text-gray-700 leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{ 
                      __html: results.description.replace(/\n/g, '<br/>') 
                    }}
                  />
                </div>
              </div>

              {/* Рекомендации */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-l-4 border-green-500 shadow-lg">
                <h3 className="text-xl font-semibold text-green-800 mb-4">
                  💡 Рекомендации
                </h3>
                <p className="text-green-700 leading-relaxed">
                  {results.recommendations}
                </p>
              </div>

              {/* Дополнительное предупреждение для высоких уровней стресса */}
              {(results.level === 'high' || results.level === 'very_high') && (
                <div className="bg-gradient-to-br from-red-50 via-orange-50 to-red-100 rounded-2xl p-6 border border-red-200/60 shadow-xl shadow-red-200/30 dark:from-red-900/20 dark:via-orange-900/20 dark:to-red-800/20 dark:border-red-700/60 dark:shadow-red-900/30">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-3">
                        Важно обратиться к специалисту
                      </h3>
                      <p className="text-red-700 dark:text-red-300 leading-relaxed mb-4">
                        Ваш уровень стресса находится в зоне повышенного риска. Рекомендуется:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-red-700 dark:text-red-300 text-sm">Записаться на консультацию к психологу</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-red-700 dark:text-red-300 text-sm">Обсудить результаты с врачом</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-red-700 dark:text-red-300 text-sm">Изменить образ жизни</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-red-700 dark:text-red-300 text-sm">Не откладывать обращение за помощью</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Кнопки действий */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={resetTest}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg px-8 py-3 shadow-lg transform hover:scale-105 transition-all duration-300 flex-1"
                >
                  Пройти тест заново
                </Button>
                            <Button 
              variant="default" 
              onClick={() => {
                try {
                  // Формируем сообщение с результатом теста на стресс
                  const levelNames: Record<string, string> = {
                    'low': 'Низкий',
                    'moderate': 'Умеренный',
                    'high': 'Высокий',
                    'very_high': 'Очень высокий'
                  };
                  
                  const levelName = levelNames[results?.level] || results?.level;
                  const score = results?.score || 0;
                  const percentage = results?.percentage || 0;
                  const description = results?.description || 'Описание недоступно';
                  const recommendations = results?.recommendations || 'Рекомендации недоступны';
                  
                  const resultText = `# 😰 Результат теста на стресс

## Уровень стресса
**${levelName}**

## Баллы
**${score}/160** (${percentage}%)

## 📋 Описание
${description}

## 💡 Рекомендации
${recommendations}`;
                  
                  // Создаем полное сообщение для Протея
                  const fullMessage = `Привет, Протей! Я только что прошел тест на стресс и хочу обсудить результаты. Вот что получилось:\n\n${resultText}\n\nМожешь помочь мне разобраться в результатах и дать рекомендации?`;
                  
                  // Сохраняем сообщение в localStorage для передачи в чат
                  localStorage.setItem('proteusChatMessage', fullMessage);
                  localStorage.setItem('proteusChatSource', 'stress-test');
                  localStorage.setItem('proteusChatTestId', 'stress');
                  
                  // Перенаправляем на страницу чата
                  navigate('/chat');
                  
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
                        // Формируем сообщение с результатом теста на стресс
                        const levelNames: Record<string, string> = {
                          'low': 'Низкий',
                          'moderate': 'Умеренный',
                          'high': 'Высокий',
                          'very_high': 'Очень высокий'
                        };
                        
                        const levelName = levelNames[results?.level] || results?.level;
                        const score = results?.score || 0;
                        const percentage = results?.percentage || 0;
                        const description = results?.description || 'Описание недоступно';
                        const recommendations = results?.recommendations || 'Рекомендации недоступны';
                        
                        const resultText = `# 😰 Результат теста на стресс

## Уровень стресса
**${levelName}**

## Баллы
**${score}/160** (${percentage}%)

## 📋 Описание
${description}

## 💡 Рекомендации
${recommendations}`;
                        
                        // Создаем полное сообщение для Протея
                        const fullMessage = `Привет, Протей! Я только что прошел тест на стресс и хочу обсудить результаты. Вот что получилось:\n\n${resultText}\n\nМожешь помочь мне разобраться в результатах и дать рекомендации?`;
                        
                                          // Сохраняем сообщение в localStorage для передачи в чат
                  localStorage.setItem('proteusChatMessage', fullMessage);
                  localStorage.setItem('proteusChatSource', 'stress-test');
                  localStorage.setItem('proteusChatTestId', 'stress');
                  
                  // Перенаправляем на страницу чата
                  navigate('/chat');
                  
                } catch (error) {
                  console.error('Error preparing chat message:', error);
                  alert('Ошибка при подготовке сообщения для чата. Попробуйте еще раз.');
                }
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9l-1 1v-1H6a2 2 0 00-2 2v4a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2z" />
              </svg>
              Поговорить с Протеем
            </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={pageAnimation}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto p-6 space-y-6"
        >
          {/* Заголовок и прогресс */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-blue-800">
                🧠 {stressTestConfig.title}
              </CardTitle>
              <p className="text-blue-600 text-lg">
                {stressTestConfig.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Вопрос {currentQuestion} из {totalQuestions}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Текущий вопрос */}
          <motion.div
            variants={cardAnimation}
            initial="initial"
            animate="animate"
            key={currentQuestion}
          >
            <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    {currentQuestionData.category}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Вопрос {currentQuestion}
                  </span>
                </div>
                <CardTitle className="text-xl text-gray-800 leading-relaxed">
                  {currentQuestionData.text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[0, 1, 2, 3, 4].map((value) => (
                    <motion.div
                      key={value}
                      variants={cardHover}
                      whileHover="hover"
                    >
                      <Button
                        variant="outline"
                        className={`w-full h-16 text-sm font-medium transition-all duration-200 ${
                          answers[currentQuestion] === value
                            ? 'bg-blue-500 text-white border-blue-500 shadow-lg scale-105'
                            : 'hover:bg-blue-50 hover:border-blue-300'
                        }`}
                        onClick={() => handleAnswer(value)}
                      >
                        <div className="text-center">
                          <div className="text-lg font-bold">{value}</div>
                          <div className="text-xs">{getAnswerLabel(value)}</div>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Важное предупреждение */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-xl shadow-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/60 dark:shadow-gray-900/50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-2">
                    Важное предупреждение
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    Этот тест оценивает уровень стресса, но не является медицинской диагностикой. 
                    Если результаты показывают высокий уровень стресса, рекомендуется обратиться к специалисту.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Инструкция */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-xl shadow-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/60 dark:shadow-gray-900/50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-2">
                    Инструкция
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    Выберите ответ, который наиболее точно описывает ваше состояние в последнее время. 
                    Отвечайте честно, чтобы получить точный результат.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  );
};

export default StressTest;