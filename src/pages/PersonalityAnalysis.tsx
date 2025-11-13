import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon, Sunrise, Star } from "lucide-react";
import { motion } from "framer-motion";
import { pageAnimation, cardAnimation, staggerContainer } from "@/lib/animations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NatalChartData } from "@/services/astrologyService";

interface SavedChart {
  id: string;
  name: string;
  chart_data: NatalChartData;
  interpretation: string;
}

const fetchLatestChart = async (): Promise<SavedChart | null> => {
  const { data, error } = await supabase
    .from('natal_charts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: No rows found, not an error here
    throw new Error(error.message);
  }
  return data;
};

const LoadingSkeleton = () => (
  <div className="space-y-8">
    <Skeleton className="h-10 w-3/4" />
    <Skeleton className="h-6 w-1/2" />
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </CardContent>
    </Card>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

const NoChartState = () => (
  <Card>
    <CardHeader>
      <CardTitle>Анализ личности</CardTitle>
    </CardHeader>
    <CardContent className="text-center space-y-4">
      <p className="text-muted-foreground">
        Чтобы получить персональный анализ, сначала нужно рассчитать и сохранить вашу натальную карту.
      </p>
      <Button asChild>
        <Link to="/astrology">
          <Star className="mr-2 h-4 w-4" />
          Перейти в раздел Астрологии
        </Link>
      </Button>
    </CardContent>
  </Card>
);

const KeyInterpretationWidget = ({ title, content }: { title: string, content: string }) => {
  const parseLine = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const lines = content.split('\n').filter(line => line.trim() !== '');

  return (
    <motion.div variants={cardAnimation}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-base leading-relaxed space-y-3">
          {lines.map((line, i) => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('* ')) {
              const listItemContent = trimmedLine.substring(2);
              return (
                <div key={i} className="flex items-start">
                  <span className="mr-3 mt-1 text-primary">•</span>
                  <p>{parseLine(listItemContent)}</p>
                </div>
              );
            }
            return <p key={i}>{parseLine(trimmedLine)}</p>;
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const PersonalityAnalysis = () => {
  const { data: chart, isLoading } = useQuery<SavedChart | null>({
    queryKey: ['latest_natal_chart'],
    queryFn: fetchLatestChart,
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!chart) {
    return <NoChartState />;
  }

  const sunSign = chart.chart_data.planets.find(p => p.name === 'Солнце')?.sign || 'Н/Д';
  const moonSign = chart.chart_data.planets.find(p => p.name === 'Луна')?.sign || 'Н/Д';
  const ascendantSign = chart.chart_data.ascendant.sign || 'Н/Д';

  const keySectionsToShow = ['САМООЦЕНКА', 'ЭМОЦИИ И РАССЛАБЛЕНИЕ', 'ТАЛАНТЫ', 'МИНУСЫ ХАРАКТЕРА'];
  
  const sections = chart.interpretation.split(/\n(?=##\s)/);

  const keyWidgets = sections.map(section => {
    const titleMatch = section.match(/##\s(.*?)\n/);
    if (titleMatch) {
        const fullTitle = titleMatch[1];
        if (keySectionsToShow.some(key => fullTitle.includes(key))) {
            const content = section.replace(/##\s.*?\n/, '').trim();
            return { title: fullTitle, content };
        }
    }
    return null;
  }).filter(Boolean);

  return (
    <motion.div
      variants={pageAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
      <motion.div 
        className="space-y-8 max-w-7xl mx-auto"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div>
          <h1 className="text-3xl font-bold">Ваш комплексный портрет</h1>
          <p className="text-muted-foreground mt-1">
            Анализ на основе вашей натальной карты, сохраненной последней.
          </p>
        </div>

        <motion.div variants={cardAnimation}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                Ключевые факты о вас
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center space-y-2 p-4 bg-accent/50 rounded-lg">
                  <Sun className="h-8 w-8 text-yellow-500" />
                  <p className="text-sm text-muted-foreground">Знак Солнца</p>
                  <p className="font-bold text-lg">{sunSign}</p>
                </div>
                <div className="flex flex-col items-center space-y-2 p-4 bg-accent/50 rounded-lg">
                  <Moon className="h-8 w-8 text-slate-400" />
                  <p className="text-sm text-muted-foreground">Знак Луны</p>
                  <p className="font-bold text-lg">{moonSign}</p>
                </div>
                <div className="flex flex-col items-center space-y-2 p-4 bg-accent/50 rounded-lg">
                  <Sunrise className="h-8 w-8 text-orange-500" />
                  <p className="text-sm text-muted-foreground">Асцендент</p>
                  <p className="font-bold text-lg">{ascendantSign}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Ключевые аспекты вашей личности</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {keyWidgets.map((widget, index) => (
              widget && <KeyInterpretationWidget key={index} title={widget.title} content={widget.content} />
            ))}
          </div>
        </div>
        
      </motion.div>
    </motion.div>
  );
};

export default PersonalityAnalysis;