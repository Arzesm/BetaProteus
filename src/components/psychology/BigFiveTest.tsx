import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BigFiveTestProps {
  onComplete: (result: string) => void;
}

export function BigFiveTest({ onComplete }: BigFiveTestProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState({
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0
  });

  const questions = [
    { question: "Я человек, который полон идей", trait: 'openness' },
    { question: "Мне легко организовывать дела и следовать плану", trait: 'conscientiousness' },
    { question: "Я общительный и разговорчивый", trait: 'extraversion' },
    { question: "Я внимателен к чувствам других людей", trait: 'agreeableness' },
    { question: "Я часто переживаю и тревожусь", trait: 'neuroticism' },
    { question: "Мне нравится пробовать новое и необычное", trait: 'openness' },
    { question: "Я довожу начатое до конца", trait: 'conscientiousness' },
    { question: "Я предпочитаю быть в центре внимания", trait: 'extraversion' },
    { question: "Я склонен идти навстречу и искать компромиссы", trait: 'agreeableness' },
    { question: "Моё настроение часто меняется", trait: 'neuroticism' },
  ].map(q => ({
    ...q,
    options: [
      { text: "Полностью согласен", score: 2 },
      { text: "Скорее согласен", score: 1 },
      { text: "Нейтрален", score: 0 },
      { text: "Скорее не согласен", score: -1 },
      { text: "Полностью не согласен", score: -2 }
    ]
  }));

  const handleAnswer = (trait: string, score: number) => {
    setScores(prev => ({
      ...prev,
      [trait]: prev[trait as keyof typeof prev] + score
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    const toLabel = (v: number) => v >= 3 ? 'Высокий' : v <= -3 ? 'Низкий' : 'Средний';
    const lines = [
      { k: 'Открытость к опыту', v: scores.openness, tip: 'Высокая открытость связана с креативностью и любознательностью; низкая — со стабильностью и практичностью.' },
      { k: 'Добросовестность', v: scores.conscientiousness, tip: 'Высокая добросовестность помогает в планировании и достижении; низкая — про гибкость и спонтанность.' },
      { k: 'Экстраверсия', v: scores.extraversion, tip: 'Высокая — про энергию и общительность; низкая — про сосредоточенность и глубину.' },
      { k: 'Доброжелательность', v: scores.agreeableness, tip: 'Высокая — про эмпатию и кооперацию; низкая — про принципиальность и независимость.' },
      { k: 'Нейротизм', v: scores.neuroticism, tip: 'Высокий уровень — чувствительность к стрессу; низкий — эмоциональная устойчивость.' },
    ];
    const summary = lines.map(({ k, v, tip }) => `**${k}: ${toLabel(v)}** — ${tip}`).join('\n');
    onComplete(summary);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
      <CardHeader>
        <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">Тест Big Five</CardTitle>
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
          {currentQuestion.options.map((option: any, index: number) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start border-blue-200 dark:border-blue-800 hover:bg-blue-100/50 dark:hover:bg-blue-900/30"
              onClick={() => handleAnswer(currentQuestion.trait, option.score)}
            >
              {option.text}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}