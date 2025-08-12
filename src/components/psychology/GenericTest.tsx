import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestConfig } from '@/data/psychologyTests';

interface GenericTestProps {
  test: TestConfig;
  onComplete: (result: string) => void;
}

export function GenericTest({ test, onComplete }: GenericTestProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState<number | Record<string, number>>(0);
  const [testState, setTestState] = useState<'testing' | 'completed'>('testing');

  const handleAnswer = (selectedScore: any) => {
    // Логика подсчета очков
    if (test.id === 'archetypes') {
      const newScore = { ...(score as Record<string, number>) };
      Object.keys(selectedScore).forEach(key => {
        newScore[key] = (newScore[key] || 0) + selectedScore[key];
      });
      setScore(newScore);
    } else {
      setScore((score as number) + selectedScore);
    }

    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResult();
      setTestState('completed');
    }
  };

  const calculateResult = () => {
    if (test.id === 'archetypes') {
      const scores = score as Record<string, number>;
      const dominant = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);
      onComplete(dominant[0]);
    } else {
      const result = test.results.find(r => 
        (score as number) >= r.min && (score as number) <= r.max
      );
      onComplete(result?.title || '');
    }
  };

  // ... остальная реализация компонента
}