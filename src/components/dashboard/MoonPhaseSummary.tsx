import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Dream {
  id: string;
  moon_data?: {
    sign: string;
    phase: string;
    illumination: number;
  };
}

export function MoonPhaseSummary() {
  const { data: dreams = [], isLoading } = useQuery<Dream[]>({
    queryKey: ['dreams_moon_stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dreams')
        .select('id, moon_data')
        .not('moon_data', 'is', null)
        .order('date', { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const dreamsWithMoonData = dreams.filter(dream => dream.moon_data);
  
  if (dreamsWithMoonData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Moon className="mr-2 h-5 w-5 text-blue-400" />
            Лунные фазы в снах
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Записывайте сны, чтобы увидеть статистику лунных фаз
          </p>
        </CardContent>
      </Card>
    );
  }

  // Подсчитываем статистику
  const phaseCounts: { [key: string]: number } = {};
  const signCounts: { [key: string]: number } = {};
  
  dreamsWithMoonData.forEach(dream => {
    if (dream.moon_data) {
      phaseCounts[dream.moon_data.phase] = (phaseCounts[dream.moon_data.phase] || 0) + 1;
      signCounts[dream.moon_data.sign] = (signCounts[dream.moon_data.sign] || 0) + 1;
    }
  });

  const mostCommonPhase = Object.entries(phaseCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  const mostCommonSign = Object.entries(signCounts)
    .sort(([,a], [,b]) => b - a)[0];

  const getPhaseEmoji = (phase: string) => {
    const phaseMap: { [key: string]: string } = {
      'Новолуние': '🌑',
      'Растущий серп': '🌒',
      'Первая четверть': '🌓',
      'Растущая луна': '🌔',
      'Полнолуние': '🌕',
      'Убывающая луна': '🌖',
      'Последняя четверть': '🌗',
      'Убывающий серп': '🌘'
    };
    return phaseMap[phase] || '🌙';
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Moon className="mr-2 h-5 w-5 text-blue-400" />
          Лунные фазы в снах
          <Badge className="ml-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
            {dreamsWithMoonData.length} снов
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mostCommonPhase && (
          <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-900/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getPhaseEmoji(mostCommonPhase[0])}</span>
              <div>
                <p className="text-sm font-medium">Самая частая фаза</p>
                <p className="text-xs text-muted-foreground">{mostCommonPhase[0]}</p>
              </div>
            </div>
            <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
              {mostCommonPhase[1]} раз
            </Badge>
          </div>
        )}
        
        {mostCommonSign && (
          <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-900/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-lg">♈</span>
              <div>
                <p className="text-sm font-medium">Луна чаще всего в</p>
                <p className="text-xs text-muted-foreground">{mostCommonSign[0]}</p>
              </div>
            </div>
            <Badge className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200">
              {mostCommonSign[1]} раз
            </Badge>
          </div>
        )}

        <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Анализ лунных фаз помогает понять, как Луна влияет на ваши сны и эмоциональное состояние.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 