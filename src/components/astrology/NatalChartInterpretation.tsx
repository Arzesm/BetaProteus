import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Sparkles, CircleDot, User, Star, Compass, Heart, Coins, Feather, Infinity } from "lucide-react";
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

const sectionThemes: Record<string, { icon: React.ElementType; accent: string }> = {
  "Вступление": { icon: Sparkles, accent: "bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-white/10 dark:via-white/5 dark:to-transparent" },
  "Личность и таланты": { icon: Star, accent: "bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-white/10 dark:via-white/5 dark:to-transparent" },
  "Деньги и реализация": { icon: Coins, accent: "bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-white/10 dark:via-white/5 dark:to-transparent" },
  "Отношения и семья": { icon: Heart, accent: "bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-white/10 dark:via-white/5 dark:to-transparent" },
  "Интуиция и духовность": { icon: Feather, accent: "bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-white/10 dark:via-white/5 dark:to-transparent" },
  "Материальные ресурсы": { icon: Coins, accent: "bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-white/10 dark:via-white/5 dark:to-transparent" },
  "Минусы и компенсации": { icon: Compass, accent: "bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-white/10 dark:via-white/5 dark:to-transparent" },
  "Итог": { icon: Infinity, accent: "bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-white/10 dark:via-white/5 dark:to-transparent" },
};

const MarkdownContent = ({ text }: { text: string }) => {
  const rawSections = text.split(/(?=\n##\s)/).filter(Boolean);

  const parseLine = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <span key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-6">
      {rawSections.map((section, idx) => {
        const titleMatch = section.match(/##\s(.*?)(\n|$)/);
        const title = titleMatch ? titleMatch[1].trim() : `Раздел ${idx + 1}`;
        const theme = sectionThemes[title] || { icon: Compass, accent: "bg-muted" };
        const Icon = theme.icon;

        const bodyLines = section.replace(/##\s.*?\n/, "").split("\n");
        const contentNodes: React.ReactNode[] = [];
        let listBuffer: React.ReactNode[] = [];

        const flushList = () => {
          if (listBuffer.length === 0) return;
          contentNodes.push(
            <ul key={`list-${contentNodes.length}`} className="space-y-2">
              {listBuffer.map((item, i) => (
                <li key={i} className="relative pl-5 text-sm leading-relaxed text-muted-foreground">
                  <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          );
          listBuffer = [];
        };

        bodyLines.forEach((rawLine, lineIdx) => {
          const line = rawLine.trim();
          if (!line) return;

          if (line.startsWith("* ")) {
            listBuffer.push(parseLine(line.slice(2)));
            return;
          }

          flushList();

          if (line.startsWith(">")) {
            contentNodes.push(
              <blockquote
                key={`quote-${idx}-${lineIdx}`}
                className="rounded-2xl border border-border bg-muted/50 p-4 text-sm italic text-muted-foreground"
              >
                {parseLine(line.replace(/^>\s?/, ""))}
              </blockquote>
            );
            return;
          }

          contentNodes.push(
            <p key={`p-${idx}-${lineIdx}`} className="text-sm leading-relaxed text-muted-foreground">
              {parseLine(line)}
            </p>
          );
        });

        flushList();

        return (
          <article
            key={idx}
            className={`rounded-[1.75rem] border border-border/70 bg-white p-7 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-white/5 ${theme.accent}`}
          >
            <div className="flex items-start gap-4">
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-white/10 dark:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground dark:text-white">{title}</h3>
                </div>
                <div className="space-y-4">{contentNodes}</div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export function NatalChartInterpretation({ chartData, interpretation, birthDetails }: NatalChartInterpretationProps) {
  const { birthData, city } = birthDetails;

  const planetRows = [...chartData.planets];
  const planetOrder = ['Солнце', 'Луна', 'Меркурий', 'Венера', 'Марс', 'Юпитер', 'Сатурн', 'Уран', 'Нептун', 'Плутон'];
  planetRows.sort((a, b) => planetOrder.indexOf(a.name) - planetOrder.indexOf(b.name));

  const northNode = chartData.nodes?.north;
  const southNode = chartData.nodes?.south;
  const configurations = chartData.configurations ?? [];
  const interpretationRef = useRef<HTMLDivElement>(null);
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCopy = async () => {
    if (!interpretationRef.current) return;
    const text = interpretationRef.current.innerText;
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('success');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch (error) {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2000);
    }
  };

  return (
    <div className="space-y-12">
      <section className="rounded-[2.5rem] border border-border bg-card/70 p-10 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <div className="grid gap-10 md:grid-cols-[1.2fr,0.8fr] md:items-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1 text-xs uppercase tracking-[0.35em] text-muted-foreground dark:bg-white/10 dark:text-white/60">
              Натальный профиль
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground dark:text-white md:text-4xl">
              {birthData.name}: индивидуальная карта развития
            </h1>
          </div>
          <div className="rounded-3xl border border-border/60 bg-background/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 md:max-w-xs">
            <div className="grid gap-3 text-sm">
              {[
                { label: "Дата", value: format(new Date(birthData.date), "d MMMM yyyy 'г.'", { locale: ru }) },
                { label: "Время", value: birthData.time },
                { label: "Локация", value: `${city.name}, ${city.country}` },
                { label: "Координаты", value: `${city.latitude.toFixed(2)}° / ${city.longitude.toFixed(2)}°` },
                { label: "Часовой пояс", value: `UTC${city.timezone >= 0 ? "+" : ""}${city.timezone}` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground dark:text-white/50">{item.label}</span>
                  <span className="font-medium text-foreground dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Card className="rounded-[1.8rem] border border-border/70 bg-card/70 shadow-sm dark:border-white/10 dark:bg-white/5">
        <CardHeader className="border-b border-border/60 pb-4 dark:border-white/10">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground dark:text-white">
            <User className="h-5 w-5 text-muted-foreground" />Исходные данные
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 p-6 md:grid-cols-2">
          {[
            { label: "Имя", value: birthData.name },
            { label: "Пол", value: birthData.gender === "male" ? "Мужской" : birthData.gender === "female" ? "Женский" : "Другой" },
            { label: "Дата", value: format(new Date(birthData.date), "d MMMM yyyy 'г.'", { locale: ru }) },
            { label: "Время", value: birthData.time },
            { label: "Город", value: `${city.name}, ${city.country}` },
            { label: "Координаты", value: `${city.latitude.toFixed(4)}° / ${city.longitude.toFixed(4)}°` },
            { label: "Часовой пояс", value: `UTC${city.timezone >= 0 ? "+" : ""}${city.timezone}` },
            { label: "Система домов", value: "Плацидус" },
          ].map((item) => (
            <div key={item.label} className="space-y-1 rounded-2xl border border-border/60 bg-background/70 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-muted-foreground dark:text-white/50">{item.label}</p>
              <p className="text-base font-medium text-foreground dark:text-white">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-[1.8rem] border border-border bg-card/75 shadow-sm dark:border-white/10 dark:bg-white/5">
        <CardHeader className="border-b border-border/60 pb-4 dark:border-white/10">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground dark:text-white">
            <Sparkles className="h-5 w-5 text-muted-foreground" />Планетарный профиль
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 bg-muted/50 dark:border-white/10 dark:bg-white/10">
                <TableHead className="text-muted-foreground">Планета</TableHead>
                <TableHead className="text-muted-foreground">Знак и градусы</TableHead>
                <TableHead className="text-right text-muted-foreground">Дом</TableHead>
                <TableHead className="text-right text-muted-foreground">Управление</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planetRows.map((row, index) => {
                const Icon = planetDetails[row.name]?.icon || CircleDot;
                return (
                  <TableRow
                    key={row.name}
                    className={index % 2 === 0 ? "border-border/50 bg-muted/30 dark:border-white/5 dark:bg-white/5" : "border-border/50"}
                  >
                    <TableCell className="font-medium text-foreground">
                      <span className={`inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm text-foreground dark:bg-white/10 dark:text-white`}>
                        <Icon className={`h-4 w-4 ${planetDetails[row.name]?.color || "text-muted-foreground"}`} />
                        {row.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground dark:text-white/70">
                      {row.sign} <span className="text-xs text-muted-foreground/70">({row.degrees.toFixed(2)}°)</span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground dark:text-white/70">{row.house}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground dark:text-white/70">
                      {row.rulesHouses && row.rulesHouses.length > 0 ? row.rulesHouses.join(', ') : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {(northNode || southNode) && (
        <Card className="rounded-[1.8rem] border border-border bg-card/75 shadow-sm dark:border-white/10 dark:bg-white/5">
          <CardHeader className="border-b border-border/60 pb-4 dark:border-white/10">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground dark:text-white">
              <Compass className="h-5 w-5 text-muted-foreground" /> Лунные узлы
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 md:grid-cols-2">
            {northNode && (
              <div className="rounded-2xl border border-border/60 bg-background/80 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground dark:text-white/50">Северный узел</p>
                <p className="mt-2 text-base font-semibold text-foreground dark:text-white">
                  {northNode.sign} · {northNode.house} дом
                </p>
                <p className="text-xs text-muted-foreground/80 dark:text-white/60">{northNode.degrees.toFixed(2)}°</p>
              </div>
            )}
            {southNode && (
              <div className="rounded-2xl border border-border/60 bg-background/80 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground dark:text-white/50">Южный узел</p>
                <p className="mt-2 text-base font-semibold text-foreground dark:text-white">
                  {southNode.sign} · {southNode.house} дом
                </p>
                <p className="text-xs text-muted-foreground/80 dark:text-white/60">{southNode.degrees.toFixed(2)}°</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <AspectsWidget aspects={chartData.aspects} />

      {configurations.length > 0 && (
        <Card className="rounded-[1.8rem] border border-border bg-card/75 shadow-sm dark:border-white/10 dark:bg-white/5">
          <CardHeader className="border-b border-border/60 pb-4 dark:border-white/10">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground dark:text-white">
              <Star className="h-5 w-5 text-muted-foreground" /> Конфигурации карты
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {configurations.map((config, index) => (
              <div
                key={`${config.name}-${index}`}
                className="rounded-2xl border border-border/60 bg-background/80 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-sm font-semibold text-foreground dark:text-white">{config.name}</p>
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground dark:text-white/50 mt-1">
                  {config.participants.join(' · ')}
                </p>
                <p className="mt-3 text-sm text-muted-foreground dark:text-white/70">{config.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <section className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground dark:text-white">Расширенная интерпретация</h2>
            <p className="max-w-3xl text-sm text-muted-foreground dark:text-white/70">
              Каждая глава — это лаконичный и точный комментарий, ориентированный на действие. Мы сохранили только самое важное.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleCopy} className="mt-2 md:mt-0">
            {copyState === 'success' ? 'Скопировано' : copyState === 'error' ? 'Ошибка копирования' : 'Скопировать интерпретацию'}
          </Button>
        </div>
        <div ref={interpretationRef}>
          <MarkdownContent text={interpretation} />
        </div>
      </section>
    </div>
  );
}