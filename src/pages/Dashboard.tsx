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
            <motion.div variants={cardAnimation} whileHover={cardHover} className="hover-lift">
              {isLoadingChart ? (
                <div className="glass-card rounded-3xl p-8 h-64 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : latestChart ? (
                <DailyInterpretationWidget chart={latestChart} />
              ) : (
                <Card className="glass-card rounded-3xl border-none shadow-soft overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center text-xl">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mr-3">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Ваш персональный прогноз
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-slate-600 mb-6">Рассчитайте и сохраните свою натальную карту, чтобы получать персональный прогноз на каждый день.</p>
                    <Button asChild className="gradient-purple-blue text-white border-none hover:shadow-lg transition-all duration-300 rounded-2xl px-8">
                      <Link to="/astrology">Рассчитать карту</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            <motion.div variants={cardAnimation} whileHover={cardHover} className="hover-lift">
              <Card className="glass-card rounded-3xl border-none shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="p-2.5 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl mr-3">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg">Последние сны</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoadingDreams ? (
                    <div className="space-y-3">
                      <div className="h-20 w-full bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl animate-pulse"></div>
                      <div className="h-20 w-full bg-gradient-to-r from-sky-100 to-blue-100 rounded-2xl animate-pulse"></div>
                    </div>
                  ) : recentDreams.length > 0 ? (
                    <div className="space-y-3">
                      {recentDreams.map((dream, index) => (
                        <div key={dream.id} className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:shadow-lg cursor-pointer bg-gradient-to-br ${
                          index % 2 === 0 
                            ? 'from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100' 
                            : 'from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate text-slate-800 group-hover:text-blue-700 transition-colors">
                                {dream.title}
                              </h4>
                              <p className="text-xs text-slate-500 mt-1">
                                {format(new Date(dream.date), "d MMM yyyy", { locale: ru })}
                              </p>
                              <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                                {dream.interpretation.length > 120 
                                  ? `${dream.interpretation.substring(0, 120)}...` 
                                  : dream.interpretation}
                              </p>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300"></div>
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
                  <Button variant="outline" asChild className="w-full mt-4 rounded-2xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300">
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
          <div className="space-y-6">
            <motion.div variants={cardAnimation} whileHover={cardHover} className="hover-lift">
              <AstroCalendar />
            </motion.div>
            <motion.div variants={cardAnimation} whileHover={cardHover} className="hover-lift">
              <MoonPhaseSummary />
            </motion.div>
            <motion.div variants={cardAnimation} whileHover={cardHover} className="hover-lift">
              <RetrospectiveWidget />
            </motion.div>
            <motion.div variants={cardAnimation} whileHover={cardHover} className="hover-lift">
              <Card className="glass-card rounded-3xl border-none shadow-soft overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center text-lg">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl mr-3">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    Астро-ключи
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 relative">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 transition-all duration-300">
                    <span className="flex items-center text-slate-600"><Sun className="mr-2 h-4 w-4 text-amber-500" />Солнце</span>
                    <span className="font-semibold text-slate-800">Телец</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300">
                    <span className="flex items-center text-slate-600"><Moon className="mr-2 h-4 w-4 text-blue-500" />Луна</span>
                    <span className="font-semibold text-slate-800">Весы</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 transition-all duration-300">
                    <span className="flex items-center text-slate-600"><Sunrise className="mr-2 h-4 w-4 text-sky-500" />Асцендент</span>
                    <span className="font-semibold text-slate-800">Весы</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 transition-all duration-300">
                    <span className="flex items-center text-slate-600"><Star className="mr-2 h-4 w-4 text-red-500" />Марс</span>
                    <span className="font-semibold text-slate-800">Лев</span>
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