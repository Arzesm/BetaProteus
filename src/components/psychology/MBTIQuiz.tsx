import { useState } from 'react';
import { mbtiQuestions, mbtiResults } from '@/data/mbtiQuestions';
import { Card, CardContent } from '@/components/ui/card';
import { generateMbtiLongDescription } from '@/lib/mbtiDescription';
import { Button } from '@/components/ui/button';
import { TestCard } from './TestCard';
import { motion } from 'framer-motion';

interface MBTIQuizProps {
  onComplete: (result: string) => void;
}

type Scores = {
  [key: string]: number;
};

export function MBTIQuiz({ onComplete }: MBTIQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState<Scores>({
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
  });

  const handleAnswer = (type: string) => {
    const newScores = { ...scores, [type]: scores[type] + 1 };
    setScores(newScores);

    if (currentQuestionIndex < mbtiQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResult(newScores);
    }
  };

  const calculateResult = (finalScores: Scores) => {
    let result = '';
    result += finalScores.E > finalScores.I ? 'E' : 'I';
    result += finalScores.S > finalScores.N ? 'S' : 'N';
    result += finalScores.T > finalScores.F ? 'T' : 'F';
    result += finalScores.J > finalScores.P ? 'J' : 'P';
    const info = mbtiResults[result];
    if (info) {
      const longText = generateMbtiLongDescription(result, info.title);
      onComplete(`**${info.title} (${result})**\n${longText}`);
    } else {
      onComplete(result);
    }
  };

  const currentQuestion = mbtiQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mbtiQuestions.length) * 100;

  return (
    <TestCard
      title="Тест MBTI"
      description={`Вопрос ${currentQuestionIndex + 1} из ${mbtiQuestions.length}`}
      progress={progress}
      question={currentQuestion.question}
      className="border-primary/20 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20"
    >
      {currentQuestion.options.map((option, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            className="w-full h-auto py-4 text-base justify-start border-primary/30 hover:bg-primary/10 hover:text-primary"
            onClick={() => handleAnswer(option.type)}
          >
            {option.text}
          </Button>
        </motion.div>
      ))}
    </TestCard>
  );
}