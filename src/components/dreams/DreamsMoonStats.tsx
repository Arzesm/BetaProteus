import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon, TrendingUp, Calendar } from "lucide-react";
import { Dream } from "@/pages/Dreams";

interface DreamsMoonStatsProps {
  dreams: Dream[];
}

interface MoonPhaseCount {
  phase: string;
  count: number;
  percentage: number;
}

interface MoonSignCount {
  sign: string;
  count: number;
  percentage: number;
}

export function DreamsMoonStats({ dreams }: DreamsMoonStatsProps) {
  // Фильтруем сны с лунными данными
  const dreamsWithMoonData = dreams.filter(dream => dream.moon_data);
  
  if (dreamsWithMoonData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Moon className="mr-2 h-5 w-5 text-blue-400" />
            Статистика лунных фаз
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Нет данных о лунных фазах для анализа
          </p>
        </CardContent>
      </Card>
    );
  }

  // Подсчитываем статистику по фазам
  const phaseCounts: { [key: string]: number } = {};
  const signCounts: { [key: string]: number } = {};
  
  dreamsWithMoonData.forEach(dream => {
    if (dream.moon_data) {
      phaseCounts[dream.moon_data.phase] = (phaseCounts[dream.moon_data.phase] || 0) + 1;
      signCounts[dream.moon_data.sign] = (signCounts[dream.moon_data.sign] || 0) + 1;
    }
  });

  const totalDreams = dreamsWithMoonData.length;
  
  const phaseStats: MoonPhaseCount[] = Object.entries(phaseCounts)
    .map(([phase, count]) => ({
      phase,
      count,
      percentage: Math.round((count / totalDreams) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const signStats: MoonSignCount[] = Object.entries(signCounts)
    .map(([sign, count]) => ({
      sign,
      count,
      percentage: Math.round((count / totalDreams) * 100)
    }))
    .sort((a, b) => b.count - a.count);

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

  const getSignEmoji = (sign: string) => {
    const signMap: { [key: string]: string } = {
      'Овен': '♈',
      'Телец': '♉',
      'Близнецы': '♊',
      'Рак': '♋',
      'Лев': '♌',
      'Дева': '♍',
      'Весы': '♎',
      'Скорпион': '♏',
      'Стрелец': '♐',
      'Козерог': '♑',
      'Водолей': '♒',
      'Рыбы': '♓'
    };
    return signMap[sign] || '⭐';
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Moon className="mr-2 h-5 w-5 text-blue-400" />
          Статистика лунных фаз
          <Badge className="ml-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
            {totalDreams} снов
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Статистика по фазам */}
        <div>
          <h4 className="font-semibold text-sm text-blue-700 dark:text-blue-300 mb-3 flex items-center">
            <TrendingUp className="mr-1 h-4 w-4" />
            Частота фаз луны
          </h4>
          <div className="space-y-2">
            {phaseStats.slice(0, 4).map((stat) => (
              <div key={stat.phase} className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-900/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getPhaseEmoji(stat.phase)}</span>
                  <span className="text-sm font-medium">{stat.phase}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 min-w-[2rem] text-right">
                    {stat.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Статистика по знакам */}
        <div>
          <h4 className="font-semibold text-sm text-indigo-700 dark:text-indigo-300 mb-3 flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            Луна в знаках зодиака
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {signStats.slice(0, 6).map((stat) => (
              <div key={stat.sign} className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-900/30 rounded-lg">
                <div className="flex items-center space-x-1">
                  <span className="text-sm">{getSignEmoji(stat.sign)}</span>
                  <span className="text-xs font-medium truncate">{stat.sign}</span>
                </div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {stat.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Инсайты */}
        <div className="pt-4 border-t border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-sm text-blue-700 dark:text-blue-300 mb-2">
            Инсайты
          </h4>
          <div className="space-y-2 text-xs text-blue-600 dark:text-blue-400">
            {phaseStats[0] && (
              <p>
                <strong>Самая частая фаза:</strong> {phaseStats[0].phase} ({phaseStats[0].percentage}% снов)
              </p>
            )}
            {signStats[0] && (
              <p>
                <strong>Луна чаще всего в:</strong> {signStats[0].sign} ({signStats[0].count} раз)
              </p>
            )}
            {phaseStats.find(p => p.phase === 'Полнолуние') && (
              <p>
                <strong>Полнолуние:</strong> {phaseStats.find(p => p.phase === 'Полнолуние')?.count || 0} ярких снов
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 