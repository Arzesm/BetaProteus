import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon, Sparkles, CircleDot, User } from "lucide-react";
import { NatalChartData } from "@/services/astrologyService";
import { BirthData } from "@/components/astrology/BirthDataForm";
import { City } from "@/data/cities";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AspectsWidget } from "./AspectsWidget";

interface NatalChartInterpretationProps {
  chartData: NatalChartData;
  interpretation: string;
  birthDetails: {
    birthData: BirthData;
    city: City;
  };
}

const planetDetails: { [key: string]: { icon: React.ElementType, color: string } } = {
  'Солнце': { icon: Sun, color: 'text-yellow-500' },
  'Луна': { icon: Moon, color: 'text-slate-400' },
  'Меркурий': { icon: CircleDot, color: 'text-gray-500' },
  'Венера': { icon: CircleDot, color: 'text-pink-500' },
  'Марс': { icon: CircleDot, color: 'text-red-500' },
  'Юпитер': { icon: CircleDot, color: 'text-orange-500' },
  'Сатурн': { icon: CircleDot, color: 'text-stone-500' },
  'Уран': { icon: CircleDot, color: 'text-cyan-500' },
  'Нептун': { icon: CircleDot, color: 'text-blue-500' },
  'Плутон': { icon: CircleDot, color: 'text-indigo-500' },
};

const MarkdownContent = ({ text }: { text: string }) => {
  const sections = text.split(/(\n##\s.*?\n)/).filter(Boolean);

  const parseLine = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const titleMatch = section.match(/##\s(.*?)\n/);
        if (titleMatch) {
          const title = titleMatch[1];
          const content = section.replace(/##\s.*?\n/, '');
          const lines = content.split('\n').filter(line => line.trim() !== '');

          return (
            <Card key={index}>
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
          );
        }
        const nonSectionLines = section.split('\n').filter(line => line.trim() !== '');
        return nonSectionLines.map((line, i) => <p key={`${index}-${i}`}>{parseLine(line)}</p>);
      })}
    </div>
  );
};

export function NatalChartInterpretation({ chartData, interpretation, birthDetails }: NatalChartInterpretationProps) {
  const { birthData, city } = birthDetails;

  const planetRows = [...chartData.planets];
  const planetOrder = ['Солнце', 'Луна', 'Меркурий', 'Венера', 'Марс', 'Юпитер', 'Сатурн', 'Уран', 'Нептун', 'Плутон'];
  planetRows.sort((a, b) => planetOrder.indexOf(a.name) - planetOrder.indexOf(b.name));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Астрологический портрет для {birthData.name}</h1>
        <p className="text-muted-foreground mt-1">
          Глубокий анализ на основе ключевых точек вашей натальной карты.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <User className="mr-3 h-5 w-5 text-blue-500" />
            Исходные данные
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Имя:</span>
              <span className="font-semibold">{birthData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Пол:</span>
              <span className="font-semibold">{birthData.gender === 'male' ? 'Мужской' : birthData.gender === 'female' ? 'Женский' : 'Другой'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Дата:</span>
              <span className="font-semibold">{format(new Date(birthData.date), "d MMMM yyyy 'г.'", { locale: ru })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Время:</span>
              <span className="font-semibold">{birthData.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Город:</span>
              <span className="font-semibold">{city.name}, {city.country}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Координаты:</span>
              <span className="font-semibold">{city.latitude.toFixed(4)}° с.ш., {city.longitude.toFixed(4)}° в.д.</span>
            </div>
             <div className="flex justify-between">
              <span className="text-muted-foreground">Часовой пояс:</span>
              <span className="font-semibold">UTC{city.timezone >= 0 ? '+' : ''}{city.timezone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Система домов:</span>
              <span className="font-semibold">Плацидус</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Sparkles className="mr-3 h-5 w-5 text-yellow-500" />
            Положения планет в натальной карте
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Планета</TableHead>
                <TableHead>Знак зодиака</TableHead>
                <TableHead className="text-right">Дом</TableHead>
                <TableHead className="text-right">Управитель</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planetRows.map((row) => {
                const Icon = planetDetails[row.name]?.icon || CircleDot;
                return (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">
                      <span className={`flex items-center ${planetDetails[row.name]?.color || 'text-muted-foreground'}`}>
                        <Icon className="mr-2 h-4 w-4" />
                        {row.name}
                      </span>
                    </TableCell>
                    <TableCell>{row.sign} ({row.degrees.toFixed(2)}°)</TableCell>
                    <TableCell className="text-right">{row.house}</TableCell>
                    <TableCell className="text-right">
                      {row.rulesHouses && row.rulesHouses.length > 0 ? row.rulesHouses.join(', ') : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AspectsWidget aspects={chartData.aspects} />

      <MarkdownContent text={interpretation} />
    </div>
  );
}