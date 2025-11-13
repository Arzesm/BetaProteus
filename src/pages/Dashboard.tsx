import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sun,
  Moon,
  Sparkles,
  Sunrise,
  Star,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { RetrospectiveWidget } from "@/components/dashboard/RetrospectiveWidget";
import { DailyInterpretationWidget } from "@/components/dashboard/DailyInterpretationWidget";
import { MoonPhaseSummary } from "@/components/dashboard/MoonPhaseSummary";
import { AstroCalendar } from "@/components/dashboard/AstroCalendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { motion } from "framer-motion";
import { pageAnimation, cardAnimation, cardHover, staggerContainer } from "@/lib/animations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { NatalChartData } from "@/services/astrologyService";

interface Dream {
  id: string;
  title: string;
  date: string;
  interpretation: string;
}

interface SavedChart {
  id: string;
  name: string;
  chart_data: NatalChartData;
}

const fetchRecentDreams = async (): Promise<Dream[]> => {
  const { data, error } = await supabase
    .from('dreams')
    .select('id, title, date, interpretation')
    .order('date', { ascending: false })
    .limit(2);
  if (error) throw new Error(error.message);
  return data;
};

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

const Dashboard = () => {
  const { data: recentDreams = [], isLoading: isLoadingDreams } = useQuery<Dream[]>({
    queryKey: ['recent_dreams'],
    queryFn: fetchRecentDreams,
  });

  const { data: latestChart, isLoading: isLoadingChart } = useQuery<SavedChart | null>({
    queryKey: ['latest_natal_chart_dashboard'],
    queryFn: fetchLatestChart,
  });

  const userName = "Пользователь";

  return (
    <motion.div
      variants={pageAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Главный экран</h1>
          <p className="text-muted-foreground">
            Ваша персональная сводка на сегодня, {userName}.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div variants={cardAnimation} whileHover={cardHover}>
              {isLoadingChart ? (
                <Skeleton className="h-64 w-full" />
              ) : latestChart ? (
                <DailyInterpretationWidget chart={latestChart} />
              ) : (
                <Card className="bg-gradient-to-br from-primary/10 to-background">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Sparkles className="mr-3 h-6 w-6 text-[#000126]" />
                      Ваш персональный прогноз
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Рассчитайте и сохраните свою натальную карту, чтобы получать персональный прогноз на каждый день.</p>
                    <Button asChild className="mt-4">
                      <Link to="/astrology">Рассчитать карту</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            <motion.div variants={cardAnimation} whileHover={cardHover}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Последние сны
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingDreams ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : recentDreams.length > 0 ? (
                    <div className="space-y-3">
                      {recentDreams.map((dream) => (
                        <div key={dream.id} className="group relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-r from-background to-muted/20 p-4 transition-all duration-300 hover:border-[#000126]/30 hover:shadow-md">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate group-hover:text-[#000126] transition-colors">
                                {dream.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(dream.date), "d MMM yyyy", { locale: ru })}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                                {dream.interpretation.length > 120 
                                  ? `${dream.interpretation.substring(0, 120)}...` 
                                  : dream.interpretation}
                              </p>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-muted-foreground">Здесь будут отображаться ваши последние сны</p>
                    </div>
                  )}
                  <Button variant="outline" asChild className="w-full mt-4 hover:bg-[#000126]/5 hover:border-[#000126]/30 transition-all duration-300">
                    <Link to="/dreams" className="flex items-center justify-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Перейти в дневник снов
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar column */}
          <div className="space-y-8">
            <motion.div variants={cardAnimation} whileHover={cardHover}>
              <AstroCalendar />
            </motion.div>
            <motion.div variants={cardAnimation} whileHover={cardHover}>
              <MoonPhaseSummary />
            </motion.div>
            <motion.div variants={cardAnimation} whileHover={cardHover}>
              <RetrospectiveWidget />
            </motion.div>
            <motion.div variants={cardAnimation} whileHover={cardHover}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Star className="mr-2 h-5 w-5 text-yellow-500" />
                    Астро-ключи
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-muted-foreground"><Sun className="mr-2 h-4 w-4" />Солнце</span>
                    <span className="font-semibold">Телец</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-muted-foreground"><Moon className="mr-2 h-4 w-4" />Луна</span>
                    <span className="font-semibold">Весы</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-muted-foreground"><Sunrise className="mr-2 h-4 w-4" />Асцендент</span>
                    <span className="font-semibold">Весы</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-muted-foreground"><Star className="mr-2 h-4 w-4 text-red-500" />Марс</span>
                    <span className="font-semibold">Лев</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;