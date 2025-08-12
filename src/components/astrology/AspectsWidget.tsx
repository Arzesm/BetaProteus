import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Aspect } from "@/services/astrologyService";
import { Sun, Moon, CircleDot, Zap } from "lucide-react";

interface AspectsWidgetProps {
  aspects: Aspect[];
}

const planetIcons: { [key: string]: React.ElementType } = {
  'Солнце': Sun,
  'Луна': Moon,
  'Меркурий': CircleDot,
  'Венера': CircleDot,
  'Марс': CircleDot,
  'Юпитер': CircleDot,
  'Сатурн': CircleDot,
  'Уран': CircleDot,
  'Нептун': CircleDot,
  'Плутон': CircleDot,
};

const aspectDetails: { [key: string]: { name: string; color: string; symbol: string; interpretation: string } } = {
  'Conjunction': { name: 'Соединение', color: '#3b82f6', symbol: '☌', interpretation: 'Слияние энергий, усиление качеств.' },
  'Opposition': { name: 'Оппозиция', color: '#0e0c0cff', symbol: '☍', interpretation: 'Напряжение, конфликт, поиск баланса.' },
  'Trine': { name: 'Трин', color: '#22c55e', symbol: '△', interpretation: 'Гармония, таланты, легкий поток энергии.' },
  'Square': { name: 'Квадрат', color: '#000000ff', symbol: '□', interpretation: 'Вызов, препятствие, двигатель роста.' },
  'Sextile': { name: 'Секстиль', color: '#cce9abff', symbol: '⚹', interpretation: 'Возможности, гармоничное взаимодействие.' },
};

export function AspectsWidget({ aspects }: AspectsWidgetProps) {
  const majorAspects = aspects.slice(0, 7);

  if (majorAspects.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Zap className="mr-3 h-5 w-5 text-yellow-500" />
          Ключевые аспекты планет
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Планеты</TableHead>
              <TableHead>Аспект</TableHead>
              <TableHead className="text-right">Орбис</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {majorAspects.map((aspect, index) => {
              const P1Icon = planetIcons[aspect.planet1] || CircleDot;
              const P2Icon = planetIcons[aspect.planet2] || CircleDot;
              const details = aspectDetails[aspect.aspectName];

              return (
                <TableRow key={index}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <P1Icon className="h-4 w-4" /> {aspect.planet1}
                    <span className="text-muted-foreground mx-1">{details?.symbol || ''}</span>
                    <P2Icon className="h-4 w-4" /> {aspect.planet2}
                  </TableCell>
                  <TableCell>
                    <Badge style={{ backgroundColor: details?.color }} className="text-white">
                      {details?.name || aspect.aspectName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{aspect.orb.toFixed(2)}°</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}