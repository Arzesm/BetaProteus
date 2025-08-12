import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TestCardProps {
  title: string;
  description: string;
  progress: number;
  question: string;
  children: React.ReactNode;
  className?: string;
}

export function TestCard({
  title,
  description,
  progress,
  question,
  children,
  className
}: TestCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("border-0 shadow-lg bg-gradient-to-br from-card to-accent/20", className)}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            {title}
          </CardTitle>
          <p className="text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Прогресс</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-accent" />
          </div>
          
          <motion.div 
            key={question}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-lg font-medium text-center px-4 py-2 bg-accent/30 rounded-lg">
              {question}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-3">
            {children}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}