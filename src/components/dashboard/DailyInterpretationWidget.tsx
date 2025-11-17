import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NatalChartData } from "@/services/astrologyService";
import { toast } from "sonner";
import { format } from "date-fns";
import { calculateTransitsForNow, TransitAspect } from "@/lib/transits";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SavedChart {
  id: string;
  name: string;
  chart_data: NatalChartData;
}

interface DailyInterpretationWidgetProps {
  chart: SavedChart;
}

// Версия кэша прогноза. При изменении правил/формата увеличивайте номер,
// чтобы принудительно игнорировать старые сохранённые тексты.
const CACHE_VERSION = 2;

export function DailyInterpretationWidget({ chart }: DailyInterpretationWidgetProps) {
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chart) {
      setIsLoading(false);
      return;
    }

    const getInterpretation = async () => {
      setIsLoading(true);
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const cacheKey = `dailyInterpretation_${chart.id}`;

      try {
        // 1. Check cache first (только если версия совпадает)
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const { date, interpretation: cachedInterpretation, version } = JSON.parse(cachedData);
          if (date === todayStr && version === CACHE_VERSION) {
            setInterpretation(cachedInterpretation);
            setIsLoading(false);
            return; // Found a valid cache for today, we're done!
          }
        }

        // 2. Calculate current transits via SwissEph
        const transits: TransitAspect[] = await calculateTransitsForNow(chart.chart_data);

        let newInterpretation: string;
        if (transits.length === 0) {
          newInterpretation =
            "Сегодня нет ярко выраженных астрологических влияний на вашу натальную карту. Это спокойный день, который можно посвятить привычным делам, восстановлению сил и мягкому саморазвитию.";
        } else {
          const { data, error } = await supabase.functions.invoke("get-daily-transit-interpretation", {
            body: { natalChart: chart.chart_data, transits: transits.slice(0, 5) },
          });

          if (error) throw error;
          newInterpretation = data.interpretation;
        }
        
        setInterpretation(newInterpretation);
        // 3. Save to cache with version
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ date: todayStr, interpretation: newInterpretation, version: CACHE_VERSION })
        );

      } catch (error: any) {
        console.error("Error getting interpretation:", error);
        toast.error("Не удалось получить прогноз на день", { description: error.message });
        setInterpretation("Не удалось загрузить прогноз на день. Попробуйте обновить страницу.");
      } finally {
        setIsLoading(false);
      }
    };

    getInterpretation();
  }, [chart]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-background">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Sparkles className="mr-3 h-6 w-6 text-primary" />
          Ваш прогноз на сегодня
        </CardTitle>
        <CardDescription>
          На основе влияния планет на вашу натальную карту
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {interpretation && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {interpretation}
            </ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}