import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  archetypeQuestions,
  archetypeTestConfig,
  calculateArchetypeResults,
  ArchetypeResult
} from '@/data/archetypeTest';

interface ArchetypeTestProps {
  onComplete: (results: ArchetypeResult[]) => void;
}

export const ArchetypeTest: React.FC<ArchetypeTestProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  // Все хуки в начале компонента
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<ArchetypeResult[]>([]);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [expandedArchetypes, setExpandedArchetypes] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Вычисляемые значения
  const totalQuestions = archetypeQuestions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const sortedResults = showResults ? [...results].sort((a, b) => b.score - a.score) : [];
  const topArchetypes = sortedResults.slice(0, 3);
  const currentQ = archetypeQuestions[currentQuestion];
  const hasAnswer = answers[currentQ.id] !== undefined;

  // Все useEffect в начале компонента
  useEffect(() => {
    if (showResults && results.length > 0 && expandedArchetypes.length === 0) {
      const topArchetype = results.sort((a, b) => b.score - a.score)[0];
      setExpandedArchetypes([topArchetype.archetype]);
    }
  }, [showResults, results, expandedArchetypes.length]);

  useEffect(() => {
    if (showResults && expandedArchetypes.length > 0) {
      setForceUpdate(prev => prev + 1);
    }
  }, [showResults, expandedArchetypes.length]);

  // Функции
  const handleAnswer = (score: number) => {
    const questionId = archetypeQuestions[currentQuestion].id;
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
    const calculatedResults = calculateArchetypeResults(answers);
    setResults(calculatedResults);
    setShowResults(true);
    onComplete(calculatedResults);
    setExpandedArchetypes([]);
  };

  const restartTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setResults([]);
    setShowFullProfile(false);
    setExpandedArchetypes([]);
  };

  const toggleArchetype = (archetype: string) => {
    setExpandedArchetypes(prev => 
      prev.includes(archetype) 
        ? prev.filter(a => a !== archetype)
        : [...prev, archetype]
    );
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'weak': return 'bg-gray-100 text-gray-800';
      case 'moderate': return 'bg-blue-100 text-blue-800';
      case 'strong': return 'bg-green-100 text-green-800';
      case 'very_strong': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'weak': return 'Слабо выражен';
      case 'moderate': return 'Умеренно выражен';
      case 'strong': return 'Сильно выражен';
      case 'very_strong': return 'Очень сильно выражен';
      default: return 'Не определен';
    }
  };

  // Один return statement с условным рендерингом
  return (
    <>
      {showResults ? (
        <div className="space-y-6">
          <Card className="border-4 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader className="bg-purple-100">
              <CardTitle className="text-3xl text-center text-purple-800 font-bold">🎭 РЕЗУЛЬТАТЫ ТЕСТА НА АРХЕТИПЫ 🎭</CardTitle>
              <p className="text-center text-purple-600 font-semibold text-lg">
                🌟 Ваш уникальный архетипический профиль личности 🌟
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Топ-3 архетипа с разворачивающимся описанием */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-center text-purple-800 bg-yellow-200 p-3 rounded-lg border-2 border-yellow-400">
                  🏆 ВАШИ ВЕДУЩИЕ АРХЕТИПЫ 🏆
                </h3>
                <p className="text-center text-lg text-purple-600 font-semibold bg-blue-100 p-2 rounded-lg border border-blue-300">
                  💡 Нажмите на любой архетип, чтобы развернуть подробное описание 💡
                </p>
                <div className="space-y-4">
                  {topArchetypes.map((result, index) => {
                    const archetypeConfig = archetypeTestConfig.archetypes[result.archetype as keyof typeof archetypeTestConfig.archetypes];
                    const IconComponent = archetypeConfig.icon;
                    
                    return (
                      <Card key={result.archetype} className="overflow-hidden shadow-2xl border-4 border-blue-300 hover:border-purple-500 transition-all duration-300 transform hover:scale-105">
                        <CardContent className="p-0">
                          <div 
                            className="p-6 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 bg-gradient-to-r from-blue-100 to-indigo-100"
                            onClick={() => toggleArchetype(result.archetype)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <IconComponent className="w-12 h-12 text-[#000126]" />
                                <div className="text-left">
                                  <h4 className="font-semibold text-lg">{archetypeConfig.name}</h4>
                                  <Badge className={getLevelColor(result.level)}>
                                    {getLevelText(result.level)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-[#000126]">
                                  {result.score}/{result.maxScore}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {result.percentage}%
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {expandedArchetypes.includes(result.archetype) ? 'Свернуть' : 'Развернуть'}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Разворачивающееся описание */}
                          {expandedArchetypes.includes(result.archetype) && (
                            <div className="border-t-4 border-purple-400 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-6 space-y-4 shadow-inner">
                              <div className="prose prose-sm max-w-none dark:prose-invert text-foreground">
                                <div 
                                  className="bg-white p-4 rounded-lg border-2 border-purple-200 shadow-lg"
                                  dangerouslySetInnerHTML={{
                                    __html: result.description.replace(/\n/g, '<br/>')
                                  }}
                                />
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="font-medium mb-2">✨ Сильные стороны</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {result.strengths.map((strength, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {strength}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <h5 className="font-medium mb-2">⚠️ Возможные слабости</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {result.weaknesses.map((weakness, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {weakness}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="font-medium mb-2">😨 Главные страхи</h5>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {result.fears.map((fear, index) => (
                                      <li key={index}>• {fear}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <h5 className="font-medium mb-2">🎯 Жизненные цели</h5>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {result.goals.map((goal, index) => (
                                      <li key={index}>• {goal}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="font-medium mb-2">👤 Как вас воспринимают другие</h5>
                                <p className="text-sm text-muted-foreground">{result.perception}</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              
              <Separator />

              {/* Детальные результаты по всем архетипам */}
              {showFullProfile && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-center">📊 Полный профиль архетипов</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {sortedResults.map((result) => {
                      const archetypeConfig = archetypeTestConfig.archetypes[result.archetype as keyof typeof archetypeTestConfig.archetypes];
                      const IconComponent = archetypeConfig.icon;
                      
                      return (
                        <AccordionItem key={result.archetype} value={result.archetype}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center space-x-3 w-full">
                              <IconComponent className="w-5 h-5 text-[#000126]" />
                              <span className="font-medium">{archetypeConfig.name}</span>
                              <Badge className={getLevelColor(result.level)}>
                                {getLevelText(result.level)}
                              </Badge>
                              <span className="ml-auto text-sm text-muted-foreground">
                                {result.score}/{result.maxScore} ({result.percentage}%)
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <div className="space-y-3">
                              <div>
                                <h5 className="font-medium mb-2">Описание</h5>
                                <div 
                                  className="text-sm text-muted-foreground"
                                  dangerouslySetInnerHTML={{
                                    __html: result.description.replace(/\n/g, '<br/>')
                                  }}
                                />
                              </div>
                              
                              <div>
                                <h5 className="font-medium mb-2">Сильные стороны</h5>
                                <div className="flex flex-wrap gap-2">
                                  {result.strengths.map((strength, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {strength}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="font-medium mb-2">Возможные слабости</h5>
                                <div className="flex flex-wrap gap-2">
                                  {result.weaknesses.map((weakness, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {weakness}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="font-medium mb-2">Главные страхи</h5>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {result.fears.map((fear, index) => (
                                    <li key={index}>• {fear}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="font-medium mb-2">Жизненные цели</h5>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {result.goals.map((goal, index) => (
                                    <li key={index}>• {goal}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="font-medium mb-2">Как вас воспринимают другие</h5>
                                <p className="text-sm text-muted-foreground">{result.perception}</p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => setShowFullProfile(!showFullProfile)} 
                  variant="outline"
                  className="flex items-center space-x-2 flex-1"
                >
                  {showFullProfile ? (
                    <>
                      <span>Скрыть полный профиль</span>
                    </>
                  ) : (
                    <>
                      <span>Показать полный профиль всех архетипов</span>
                    </>
                  )}
                </Button>
                <Button 
                  onClick={restartTest} 
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold text-lg px-8 py-3 shadow-lg transform hover:scale-105 transition-all duration-300 flex-1"
                >
                  🔄 Пройти тест заново 🔄
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => {
                    try {
                      // Формируем сообщение с результатом теста архетипов
                      const archetypeNames: Record<string, string> = {
                        'innocent': 'Невинный',
                        'everyman': 'Обыватель',
                        'hero': 'Герой',
                        'caregiver': 'Заботливый',
                        'explorer': 'Искатель',
                        'rebel': 'Бунтарь',
                        'lover': 'Любовник',
                        'creator': 'Творец',
                        'jester': 'Шут',
                        'sage': 'Мудрец',
                        'magician': 'Маг',
                        'ruler': 'Правитель'
                      };
                      
                      const levelNames: Record<string, string> = {
                        'weak': 'Слабый',
                        'moderate': 'Умеренный',
                        'strong': 'Сильный',
                        'very_strong': 'Очень сильный'
                      };
                      
                      const topArchetypes = results.slice(0, 3).map((archetype, index) => {
                        const archetypeName = archetypeNames[archetype.archetype] || archetype.archetype;
                        const levelName = levelNames[archetype.level] || archetype.level;
                        const score = archetype.score || 0;
                        
                        return `${index + 1}. **${archetypeName}** - ${levelName} (${score} баллов)`;
                      }).join('\n');
                      
                      // Создаем полное сообщение для Протея
                      const fullMessage = `Привет, Протей! Я только что прошел тест на архетипы и хочу обсудить результаты. Вот что получилось:\n\n# 👑 Результаты теста на архетипы\n\n## Мои ведущие архетипы\n\n${topArchetypes}\n\nМожешь помочь мне разобраться в результатах и дать рекомендации?`;
                      
                                        // Сохраняем сообщение в localStorage для передачи в чат
                  localStorage.setItem('proteusChatMessage', fullMessage);
                  localStorage.setItem('proteusChatSource', 'archetype-test');
                  localStorage.setItem('proteusChatTestId', 'archetype');
                  
                  // Перенаправляем на страницу чата
                  navigate('/chat');
                  
                } catch (error) {
                  console.error('Error preparing chat message:', error);
                  alert('Ошибка при подготовке сообщения для чата. Попробуйте еще раз.');
                }
              }}
              className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 0 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Поделиться
            </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    try {
                      // Формируем сообщение с результатом теста архетипов
                      const archetypeNames: Record<string, string> = {
                        'innocent': 'Невинный',
                        'everyman': 'Обыватель',
                        'hero': 'Герой',
                        'caregiver': 'Заботливый',
                        'explorer': 'Искатель',
                        'rebel': 'Бунтарь',
                        'lover': 'Любовник',
                        'creator': 'Творец',
                        'jester': 'Шут',
                        'sage': 'Мудрец',
                        'magician': 'Маг',
                        'ruler': 'Правитель'
                      };
                      
                      const levelNames: Record<string, string> = {
                        'weak': 'Слабый',
                        'moderate': 'Умеренный',
                        'strong': 'Сильный',
                        'very_strong': 'Очень сильный'
                      };
                      
                      const topArchetypes = results.slice(0, 3).map((archetype, index) => {
                        const archetypeName = archetypeNames[archetype.archetype] || archetype.archetype;
                        const levelName = levelNames[archetype.level] || archetype.level;
                        const score = archetype.score || 0;
                        
                        return `${index + 1}. **${archetypeName}** - ${levelName} (${score} баллов)`;
                      }).join('\n');
                      
                      // Создаем полное сообщение для Протея
                      const fullMessage = `Привет, Протей! Я только что прошел тест на архетипы и хочу обсудить результаты. Вот что получилось:\n\n# 👑 Результаты теста на архетипы\n\n## Мои ведущие архетипы\n\n${topArchetypes}\n\nМожешь помочь мне разобраться в результатах и дать рекомендации?`;
                      
                                        // Сохраняем сообщение в localStorage для передачи в чат
                  localStorage.setItem('proteusChatMessage', fullMessage);
                  localStorage.setItem('proteusChatSource', 'archetype-test');
                  localStorage.setItem('proteusChatTestId', 'archetype');
                  
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
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9l-1 1v-1H6a2 2 0 00-2 2v4a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2z" />
              </svg>
              Поговорить с Протеем
            </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="pb-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">
                      Вопрос {currentQuestion + 1} из {totalQuestions}
                    </h2>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {archetypeTestConfig.archetypes[currentQ.archetype].name}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Прогресс</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4 p-6 bg-muted/30 rounded-lg border border-border/50">
                <h3 className="text-xl font-semibold leading-relaxed text-foreground">
                  {currentQ.question}
                </h3>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <span className="px-3 py-1 bg-background rounded-full border border-border">
                    Выберите ответ по шкале от 0 до 3
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center mb-4">
                  {hasAnswer && (
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-sm font-medium">Ответ выбран</span>
                    </div>
                  )}
                </div>
                
                <div className="grid gap-4">
                  <Button
                    variant={answers[currentQ.id] === 0 ? "default" : "outline"}
                    onClick={() => handleAnswer(0)}
                    className={`justify-start h-auto p-6 text-left transition-all duration-200 ${
                      answers[currentQ.id] === 0 
                        ? "bg-[#000126] text-white hover:bg-[#000126]/90 shadow-lg" 
                        : "hover:bg-accent hover:border-[#000126]/30 hover:shadow-md"
                    }`}
                  >
                    <div className="w-full">
                      <div className="font-semibold text-base mb-2">0 - Совсем не про меня</div>
                      <div className="text-sm leading-relaxed opacity-90">
                        Это утверждение абсолютно не соответствует моей личности
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant={answers[currentQ.id] === 1 ? "default" : "outline"}
                    onClick={() => handleAnswer(1)}
                    className={`justify-start h-auto p-6 text-left transition-all duration-200 ${
                      answers[currentQ.id] === 1 
                        ? "bg-[#000126] text-white hover:bg-[#000126]/90 shadow-lg" 
                        : "hover:bg-accent hover:border-[#000126]/30 hover:shadow-md"
                    }`}
                  >
                    <div className="w-full">
                      <div className="font-semibold text-base mb-2">1 - Скорее не про меня</div>
                      <div className="text-sm leading-relaxed opacity-90">
                        Это утверждение в основном не соответствует моей личности
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant={answers[currentQ.id] === 2 ? "default" : "outline"}
                    onClick={() => handleAnswer(2)}
                    className={`justify-start h-auto p-6 text-left transition-all duration-200 ${
                      answers[currentQ.id] === 2 
                        ? "bg-[#000126] text-white hover:bg-[#000126]/90 shadow-lg" 
                        : "hover:bg-accent hover:border-[#000126]/30 hover:shadow-md"
                    }`}
                  >
                    <div className="w-full">
                      <div className="font-semibold text-base mb-2">2 - Иногда про меня</div>
                      <div className="text-sm leading-relaxed opacity-90">
                        Это утверждение иногда соответствует моей личности
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant={answers[currentQ.id] === 3 ? "default" : "outline"}
                    onClick={() => handleAnswer(3)}
                    className={`justify-start h-auto p-6 text-left transition-all duration-200 ${
                      answers[currentQ.id] === 3 
                        ? "bg-[#000126] text-white hover:bg-[#000126]/90 shadow-lg" 
                        : "hover:bg-accent hover:border-[#000126]/30 hover:shadow-md"
                    }`}
                  >
                    <div className="w-full">
                      <div className="font-semibold text-base mb-2">3 - Очень похоже на меня</div>
                      <div className="text-sm leading-relaxed opacity-90">
                        Это утверждение очень точно описывает мою личность
                      </div>
                    </div>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-border/50">
                <Button
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  className="px-6 py-3 h-auto"
                >
                  ← Назад
                </Button>
                
                {currentQuestion === totalQuestions - 1 ? (
                  <Button
                    onClick={finishTest}
                    disabled={!hasAnswer}
                    className="bg-[#000126] hover:bg-[#000126]/90 px-8 py-3 h-auto text-lg font-semibold"
                  >
                    🎯 Завершить тест
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    disabled={!hasAnswer}
                    className="px-8 py-3 h-auto text-lg font-semibold"
                  >
                    Следующий вопрос →
                  </Button>
                )}
              </div>

              {!hasAnswer && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Пожалуйста, выберите ответ, чтобы продолжить
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};