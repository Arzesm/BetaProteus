import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
// Use our patched version that passes window.Module config
import SwissEph from '../../../swisseph-wasm-main/src/swisseph.js';
import { NatalChartData } from "@/services/astrologyService";
import { toast } from "sonner";
import { format } from "date-fns";

interface SavedChart {
  id: string;
  name: string;
  chart_data: NatalChartData;
}

interface DailyInterpretationWidgetProps {
  chart: SavedChart;
}

interface TransitAspect {
  transitingPlanet: string;
  aspectName: string;
  natalPlanet: string;
  orb: number;
}

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
        // 1. Check cache first
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const { date, interpretation: cachedInterpretation } = JSON.parse(cachedData);
          if (date === todayStr) {
            setInterpretation(cachedInterpretation);
            setIsLoading(false);
            return; // Found a valid cache for today, we're done!
          }
        }

        // 2. If no valid cache, generate new interpretation
        const swe = new SwissEph();
        await swe.initSwissEph();

        const now = new Date();
        const jd_ut = swe.julday(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(), now.getUTCHours() + now.getUTCMinutes() / 60);

        const transitingPlanets = [
          { id: swe.SE_SUN, name: 'Солнце' }, { id: swe.SE_MOON, name: 'Луна' },
          { id: swe.SE_MERCURY, name: 'Меркурий' }, { id: swe.SE_VENUS, name: 'Венера' },
          { id: swe.SE_MARS, name: 'Марс' }, { id: swe.SE_JUPITER, name: 'Юпитер' },
          { id: swe.SE_SATURN, name: 'Сатурн' },
        ];

        const currentPositions = transitingPlanets.map(p => ({
          ...p,
          longitude: swe.calc_ut(jd_ut, p.id, swe.SEFLG_SWIEPH)[0]
        }));

        const natalPlanets = chart.chart_data.planets;
        const foundAspects: TransitAspect[] = [];

        const aspectTypes = [
          { name: 'Conjunction', angle: 0, orb: 2 },
          { name: 'Opposition', angle: 180, orb: 2 },
          { name: 'Trine', angle: 120, orb: 2 },
          { name: 'Square', angle: 90, orb: 2 },
          { name: 'Sextile', angle: 60, orb: 2 },
        ];

        for (const tp of currentPositions) {
          for (const np of natalPlanets) {
            let angle = Math.abs(tp.longitude - np.longitude);
            if (angle > 180) angle = 360 - angle;

            for (const aspect of aspectTypes) {
              const orb = Math.abs(angle - aspect.angle);
              if (orb <= aspect.orb) {
                foundAspects.push({
                  transitingPlanet: tp.name,
                  aspectName: aspect.name,
                  natalPlanet: np.name,
                  orb,
                });
              }
            }
          }
        }
        
        swe.close();

        const significantAspects = foundAspects.sort((a, b) => a.orb - b.orb).slice(0, 5);

        let newInterpretation;
        if (significantAspects.length === 0) {
          newInterpretation = "Сегодня нет значимых астрологических влияний. Это спокойный день, который можно посвятить текущим делам и отдыху.";
        } else {
          const { data, error } = await supabase.functions.invoke('get-daily-transit-interpretation', {
            body: { natalChart: chart.chart_data, transits: significantAspects },
          });

          if (error) throw error;
          newInterpretation = data.interpretation;
        }
        
        setInterpretation(newInterpretation);
        // 3. Save to cache
        localStorage.setItem(cacheKey, JSON.stringify({ date: todayStr, interpretation: newInterpretation }));

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
        <p style={{ whiteSpace: 'pre-wrap' }}>{interpretation}</p>
      </CardContent>
    </Card>
  );
}