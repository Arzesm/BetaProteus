import { useState } from "react";
import { BirthDataForm, BirthData } from "@/components/astrology/BirthDataForm";
import { NatalChartInterpretation } from "@/components/astrology/NatalChartInterpretation";
import { SavedChartsList } from "@/components/astrology/SavedChartsList";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { pageAnimation, cardAnimation, cardHover } from "@/lib/animations";
import { calculateNatalChart, NatalChartData } from "@/services/astrologyService";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { cities, City } from "@/data/cities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, PlusCircle } from "lucide-react";
import { format } from "date-fns";

interface SavedChart {
  id: string;
  created_at: string;
  name: string;
  gender: string;
  birth_date: string;
  birth_time: string;
  city_name: string;
  latitude: number;
  longitude: number;
  timezone: number;
  chart_data: NatalChartData;
  interpretation: string;
}

interface ActiveChart {
  birthDetails: { birthData: BirthData; city: City };
  chartData: NatalChartData;
  interpretation: string;
  isSaved: boolean;
  id?: string;
}

const Astrology = () => {
  const [activeChart, setActiveChart] = useState<ActiveChart | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const queryClient = useQueryClient();

  const { data: savedCharts = [], isLoading: isLoadingCharts } = useQuery<SavedChart[]>({
    queryKey: ['natal_charts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('natal_charts').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const addChartMutation = useMutation({
    mutationFn: async (chart: Omit<SavedChart, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('natal_charts').insert([chart]).select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['natal_charts'] });
      toast.success("Карта успешно сохранена!");
      if (activeChart) {
        setActiveChart({ ...activeChart, isSaved: true });
      }
    },
    onError: (error: Error) => {
      toast.error("Не удалось сохранить карту", { description: error.message });
    }
  });

  const deleteChartMutation = useMutation({
    mutationFn: async (chartId: string) => {
      const { error } = await supabase.from('natal_charts').delete().eq('id', chartId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['natal_charts'] });
      toast.success("Карта удалена.");
      setActiveChart(null);
    },
    onError: (error: Error) => {
      toast.error("Не удалось удалить карту", { description: error.message });
    }
  });

  const handleFormSubmit = async (data: BirthData) => {
    setIsCalculating(true);
    const calculationToast = toast.loading("Рассчитываем вашу натальную карту...");

    try {
      const city = cities.find(c => c.name.toLowerCase() === data.city.toLowerCase());
      if (!city) throw new Error("Выбранный город не найден в базе данных.");
      
      const calculatedChart = await calculateNatalChart(data, city);
      toast.success("Положения планет рассчитаны!", { id: calculationToast });

      const interpretationToast = toast.loading("Протей составляет ваш портрет...");
      const { data: interpretationData, error } = await supabase.functions.invoke('get-natal-chart-interpretation', {
        body: { name: data.name, gender: data.gender, planets: calculatedChart.planets, ascendant: calculatedChart.ascendant, aspects: calculatedChart.aspects },
      });
      if (error) throw error;

      setActiveChart({
        birthDetails: { birthData: data, city },
        chartData: calculatedChart,
        interpretation: interpretationData.interpretation,
        isSaved: false,
      });
      toast.success("Ваш астрологический портрет готов!", { id: interpretationToast });

    } catch (error: any) {
      let errorDescription = "Произошла неизвестная ошибка.";
      if (error instanceof FunctionsHttpError) {
        try {
          const errorJson = await error.context.json();
          if (errorJson.error) errorDescription = errorJson.error;
        } catch {}
      } else if (error.message) errorDescription = error.message;
      toast.error("Не удалось составить карту", { id: calculationToast, description: errorDescription });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSaveChart = () => {
    if (!activeChart || activeChart.isSaved) return;
    const { birthData, city } = activeChart.birthDetails;
    addChartMutation.mutate({
      name: birthData.name,
      gender: birthData.gender,
      birth_date: format(birthData.date, 'yyyy-MM-dd'),
      birth_time: birthData.time,
      city_name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone,
      chart_data: activeChart.chartData,
      interpretation: activeChart.interpretation,
    });
  };

  const handleViewChart = (chartId: string) => {
    const chart = savedCharts.find(c => c.id === chartId);
    if (chart) {
      const birthData: BirthData = {
        name: chart.name,
        gender: chart.gender as "male" | "female" | "other",
        date: new Date(chart.birth_date),
        time: chart.birth_time,
        city: chart.city_name,
      };
      const city = cities.find(c => c.name === chart.city_name);
      if (city) {
        setActiveChart({
          id: chart.id,
          birthDetails: { birthData, city },
          chartData: chart.chart_data,
          interpretation: chart.interpretation,
          isSaved: true,
        });
      }
    }
  };

  const handleNewCalculation = () => {
    setActiveChart(null);
  };

  return (
    <motion.div variants={pageAnimation} initial="initial" animate="animate" exit="exit" className="space-y-8">
      <AnimatePresence mode="wait">
        {activeChart ? (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <NatalChartInterpretation
              chartData={activeChart.chartData}
              interpretation={activeChart.interpretation}
              birthDetails={activeChart.birthDetails}
            />
            <div className="flex justify-center gap-4">
              <Button onClick={handleNewCalculation} variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Новый расчет
              </Button>
              {!activeChart.isSaved && (
                <Button onClick={handleSaveChart} disabled={addChartMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {addChartMutation.isPending ? "Сохранение..." : "Сохранить карту"}
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Астрология</h1>
              <p className="text-muted-foreground mt-2">
                Введите свои данные о рождении, чтобы построить натальную карту и получить ее интерпретацию.
              </p>
            </div>
            <motion.div variants={cardAnimation} whileHover={cardHover}>
              <BirthDataForm onSubmit={handleFormSubmit} isCalculating={isCalculating} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={cardAnimation}>
        <SavedChartsList
          charts={savedCharts}
          onView={handleViewChart}
          onDelete={deleteChartMutation.mutate}
          isLoading={isLoadingCharts}
        />
      </motion.div>
    </motion.div>
  );
};

export default Astrology;