import React, { useState } from 'react';
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

interface ArchetypeTestNewProps {
  onComplete: (results: ArchetypeResult[]) => void;
}

export const ArchetypeTestNew: React.FC<ArchetypeTestNewProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<ArchetypeResult[]>([]);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [expandedArchetypes, setExpandedArchetypes] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  const totalQuestions = archetypeQuestions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

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
    
    // Автоматически разворачиваем первый архетип
    if (calculatedResults.length > 0) {
      const topArchetype = calculatedResults.sort((a, b) => b.score - a.score)[0];
      setExpandedArchetypes([topArchetype.archetype]);
    }
    
    setResults(calculatedResults);
    setShowResults(true);
    onComplete(calculatedResults);
  };

  const restartTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setResults([]);
    setShowFullProfile(false);
    setExpandedArchetypes([]);
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

  if (showResults) {
    // Сортируем результаты по убыванию баллов
    const sortedResults = [...results].sort((a, b) => b.score - a.score);
    const topArchetypes = sortedResults.slice(0, 3);
    
    // Отладочная информация
    console.log('Состояние expandedArchetypes:', expandedArchetypes);
    console.log('Топ архетипы:', topArchetypes.map(r => r.archetype));
    console.log('Первый архетип:', topArchetypes[0]?.archetype);
    console.log('Описание первого архетипа:', topArchetypes[0]?.description);

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">🎭 Результаты теста на архетипы</CardTitle>
            <p className="text-center text-muted-foreground">
              Ваш архетипический профиль личности
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Большая отладочная информация */}
            <div className="p-4 bg-red-100 border-2 border-red-500 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-red-800">🚨 ОТЛАДОЧНАЯ ИНФОРМАЦИЯ</h4>
                <Button 
                  onClick={() => setForceUpdate(prev => prev + 1)} 
                  size="sm" 
                  variant="outline"
                  className="text-red-800 border-red-500"
                >
                  Обновить (Force Update: {forceUpdate})
                </Button>
              </div>
              <div className="space-y-2 text-sm text-red-800">
                <p><strong>Количество результатов:</strong> {results.length}</p>
                <p><strong>Состояние expandedArchetypes:</strong> [{expandedArchetypes.join(', ') || 'пусто'}]</p>
                <p><strong>Первый архетип:</strong> {topArchetypes[0]?.archetype || 'НЕТ'}</p>
                <p><strong>Длина описания первого архетипа:</strong> {topArchetypes[0]?.description?.length || 0} символов</p>
                <p><strong>Первые 100 символов описания:</strong> {topArchetypes[0]?.description?.substring(0, 100) || 'НЕТ ОПИСАНИЯ'}</p>
                <p><strong>Уровень первого архетипа:</strong> {topArchetypes[0]?.level || 'НЕТ'}</p>
                <p><strong>Функция getArchetypeDescription работает:</strong> {topArchetypes[0]?.archetype && topArchetypes[0]?.level ? 'ДА' : 'НЕТ'}</p>
              </div>
            </div>
            
            {/* Топ-3 архетипа с разворачивающимся описанием */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">🏆 Ваши ведущие архетипы</h3>
              <p className="text-center text-sm text-muted-foreground">
                💡 Нажмите на любой архетип, чтобы развернуть подробное описание
              </p>
              <div className="space-y-4">
                {topArchetypes.map((result, index) => {
                  const archetypeConfig = archetypeTestConfig.archetypes[result.archetype as keyof typeof archetypeTestConfig.archetypes];
                  const IconComponent = archetypeConfig.icon;
                  
                  return (
                    <Card key={result.archetype} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div 
                          className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            const currentExpanded = expandedArchetypes.includes(result.archetype);
                            if (currentExpanded) {
                              setExpandedArchetypes(expandedArchetypes.filter(a => a !== result.archetype));
                            } else {
                              setExpandedArchetypes([...expandedArchetypes, result.archetype]);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <IconComponent className="w-12 h-12 text-primary" />
                              <div className="text-left">
                                <h4 className="font-semibold text-lg">{archetypeConfig.name}</h4>
                                <Badge className={getLevelColor(result.level)}>
                                  {getLevelText(result.level)}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">
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
                          <div className="border-t bg-muted/30 p-6 space-y-4">
                            <div className="prose prose-sm max-w-none dark:prose-invert text-foreground">
                              <div 
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
                            <IconComponent className="w-5 h-5 text-primary" />
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

            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => setShowFullProfile(!showFullProfile)} 
                variant="outline"
                className="flex items-center space-x-2"
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
              <Button onClick={restartTest} variant="outline">
                Пройти тест заново
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Текущий вопрос
  const currentQ = archetypeQuestions[currentQuestion];
  const hasAnswer = answers[currentQ.id] !== undefined;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">🎭 Тест на архетипы</h2>
              <span className="text-sm text-muted-foreground">
                Вопрос {currentQuestion + 1} из {totalQuestions}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">{currentQ.question}</h3>
            <p className="text-sm text-muted-foreground">
              Выберите ответ по шкале от 0 до 3
            </p>
          </div>

          <div className="grid gap-3">
            {[0, 1, 2, 3].map((score) => (
              <Button
                key={score}
                variant={answers[currentQ.id] === score ? "default" : "outline"}
                className="justify-start h-auto p-4"
                onClick={() => handleAnswer(score)}
              >
                <div className="text-left">
                  <div className="font-medium">{score} баллов</div>
                  <div className="text-sm text-muted-foreground">
                    {score === 0 && "Совсем не согласен"}
                    {score === 1 && "Скорее не согласен"}
                    {score === 2 && "Скорее согласен"}
                    {score === 3 && "Полностью согласен"}
                  </div>
                </div>
              </Button>
            ))}
          </div>

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
                className="bg-primary hover:bg-primary/90"
              >
                Завершить тест
              </Button>
            ) : (
              <Button
                onClick={nextQuestion}
                disabled={!hasAnswer}
                className="bg-primary hover:bg-primary/90"
              >
                Далее
              </Button>
            )}
          </div>

          {!hasAnswer && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Пожалуйста, выберите ответ, чтобы продолжить
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
