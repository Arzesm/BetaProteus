import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ArchetypeTestProps {
  onComplete: (result: string) => void;
}

export function ArchetypeTest({ onComplete }: ArchetypeTestProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState({
    hero: 0,
    sage: 0,
    caregiver: 0,
    // Добавьте другие архетипы...
  });

  const questions = [
    {
      question: "В сложной ситуации я обычно:",
      options: [
        { text: "Ищу решение проблемы", archetype: 'hero', score: 1 },
        { text: "Пытаюсь понять скрытые причины", archetype: 'sage', score: 1 },
        { text: "Забочусь о чувствах окружающих", archetype: 'caregiver', score: 1 }
      ]
    },
    {
      question: "Когда начинаю новый проект, я прежде всего:",
      options: [
        { text: "Определяю цель и бросаю вызов", archetype: 'hero', score: 1 },
        { text: "Собираю информацию и создаю модель", archetype: 'sage', score: 1 },
        { text: "Думаю о людях и их потребностях", archetype: 'caregiver', score: 1 }
      ]
    },
    {
      question: "Чаще всего окружающие видят во мне:",
      options: [
        { text: "Смелого и упорного", archetype: 'hero', score: 1 },
        { text: "Мудрого и спокойного", archetype: 'sage', score: 1 },
        { text: "Теплого и поддерживающего", archetype: 'caregiver', score: 1 }
      ]
    }
  ];

  const handleAnswer = (archetype: string) => {
    setScores(prev => ({
      ...prev,
      [archetype]: prev[archetype as keyof typeof prev] + 1
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    const dominantArchetype = Object.entries(scores).reduce(
      (a, b) => (a[1] > b[1] ? a : b)
    )[0];
    const descriptions: Record<string, string> = {
      hero: '**Герой** — стремится преодолевать препятствия и доказывать силу характера. Рекомендация: ставьте измеримые цели и отмечайте прогресс.',
      sage: '**Мудрец** — ищет понимание и смысл. Рекомендация: выделяйте время на глубокую работу и исследование интересующих тем.',
      caregiver: '**Опекун** — заботится и поддерживает. Рекомендация: раз в день практикуйте самозаботу, чтобы не выгорать.',
    };
    onComplete(descriptions[dominantArchetype] || dominantArchetype);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <CardHeader>
        <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">Тест на архетипы</CardTitle>
        <CardDescription>
          Вопрос {currentQuestionIndex + 1} из {questions.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground">
            {Math.round(progress)}%
          </p>
        </div>
        <p className="text-lg font-semibold">{currentQuestion.question}</p>
        <div className="grid grid-cols-1 gap-2">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start"
              onClick={() => handleAnswer(option.archetype)}
            >
              {option.text}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}