import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SwissEph from 'swisseph-wasm';
import { NatalChartData } from "@/services/astrologyService";

interface SavedChart {
  id: string;
  name: string;
  chart_data: NatalChartData;
}

interface TransitAspect {
  transitingPlanet: string;
  aspectName: string;
  natalPlanet: string;
  orb: number;
  interpretation: string;
}

const fetchLatestChart = async (): Promise<SavedChart | null> => {
  const { data, error } = await supabase
    .from('natal_charts')
    .select('id, name, chart_data')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }
  return data;
};

const aspectDetails: { [key: string]: { name: string; color: string; interpretation: string } } = {
  'Conjunction': { name: 'Соединение', color: 'bg-blue-500', interpretation: 'Слияние энергий, новое начало.' },
  'Opposition': { name: 'Оппозиция', color: 'bg-slate-800', interpretation: 'Напряжение, поиск баланса.' },
  'Trine': { name: 'Трин', color: 'bg-green-500', interpretation: 'Гармония и удача.' },
  'Square': { name: 'Квадрат', color: 'bg-red-500', interpretation: 'Вызов и напряжение.' },
  'Sextile': { name: 'Секстиль', color: 'bg-sky-400', interpretation: 'Возможности и поддержка.' },
};

export function TransitsWidget() {
  const { data: chart, isLoading } = useQuery<SavedChart | null>({
    queryKey: ['latest_natal_chart_transits'],
    queryFn: fetchLatestChart,
  });
  const [transits, setTransits] = useState<TransitAspect[]>([]);
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    if (chart) {
      const calculateTransits = async () => {
        setIsCalculating(true);
        const swe = new SwissEph();
        await swe.initSwissEph();

        try {
          const now = new Date();
          const jd_ut = swe.julday(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(), now.getUTCHours() + now.getUTCMinutes() / 60);

          const transitingPlanets = [
            { id: swe.SE_SUN, name: 'Солнце' }, { id: swe.SE_MOON, name: 'Луна' },
            { id: swe.SE_MERCURY, name: 'Меркурий' }, { id: swe.SE_VENUS, name: 'Венера' },
            { id: swe.SE_MARS, name: 'Марс' }, { id: swe.SE_JUPITER, name: 'Юпитер' },
            { id: swe.SE_SATURN, name: 'Сатурн' }, { id: swe.SE_URANUS, name: 'Уран' },
            { id: swe.SE_NEPTUNE, name: 'Нептун' }, { id: swe.SE_PLUTO, name: 'Плутон' },
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
                    interpretation: aspectDetails[aspect.name]?.interpretation || ''
                  });
                }
              }
            }
          }
          setTransits(foundAspects.sort((a, b) => a.orb - b.orb));
        } finally {
          swe.close();
          setIsCalculating(false);
        }
      };
      calculateTransits();
    } else {
      setIsCalculating(false);
    }
  }, [chart]);

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!chart) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Zap className="mr-2 h-5 w-5 text-yellow-500" />
            Сегодняшние транзиты
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Рассчитайте и сохраните натальную карту, чтобы видеть ежедневные транзиты.
          </p>
          <Button asChild size="sm">
            <Link to="/astrology">
              <Star className="mr-2 h-4 w-4" />
              Рассчитать карту
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Zap className="mr-2 h-5 w-5 text-yellow-500" />
          Сегодняшние транзиты
        </CardTitle>
        <p className="text-sm text-muted-foreground pt-1">для {chart.name}</p>
      </CardHeader>
      <CardContent>
        {isCalculating ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : transits.length > 0 ? (
          <div className="space-y-3">
            {transits.slice(0, 4).map((aspect, index) => (
              <div key={index} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Тр. {aspect.transitingPlanet}</span>
                  <Badge className={`${aspectDetails[aspect.aspectName]?.color} text-white text-xs`}>
                    {aspectDetails[aspect.aspectName]?.name}
                  </Badge>
                  <span className="font-semibold">Ваш {aspect.natalPlanet}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{aspect.interpretation}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Сегодня нет значимых точных аспектов.
          </p>
        )}
      </CardContent>
    </Card>
  );
}