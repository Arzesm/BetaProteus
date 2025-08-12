import React, { useState } from 'react';
import { stressTestQuestions, stressTestResults } from '@/data/stressTestQuestions';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StressTestProps {
  onComplete: (result: string) => void;
}

export function StressTest({ onComplete }: StressTestProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [testState, setTestState] = useState<'testing' | 'completed'>('testing');

  const handleAnswer = (selectedScore: number) => {
    const newScore = score + selectedScore;
    setScore(newScore);

    if (currentQuestionIndex < stressTestQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const result = stressTestResults.find(r => newScore >= r.min && newScore <= r.max);
      onComplete(result?.title || '');
      setTestState('completed');
    }
  };

  const currentQuestion = stressTestQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / stressTestQuestions.length) * 100;

  if (testState === 'completed') {
    const result = stressTestResults.find(r => score >= r.min && score <= r.max);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Результаты теста</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{result?.title}</h3>
            <p>{result?.description}</p>
            <p>Ваш балл: {score}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20">
      <CardHeader>
        <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-red-600">Тест на уровень стресса</CardTitle>
        <CardDescription>Вопрос {currentQuestionIndex + 1} из {stressTestQuestions.length}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground">{Math.round(progress)}%</p>
        </div>
        <p className="text-lg font-semibold">{currentQuestion.question}</p>
        <div className="grid grid-cols-1 gap-2">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start border-rose-200 dark:border-rose-800 hover:bg-rose-100/50 dark:hover:bg-rose-900/30"
              onClick={() => handleAnswer(option.score)}
            >
              {option.text}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}