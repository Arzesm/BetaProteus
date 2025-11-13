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
  const rawSections = text.split(/(?=\n(?:#{1,6}\s|\d{1,2}\)\s))/).filter(Boolean);

  const parseLine = (line: string) => {
    // Санитизация незакрытых **: если количество ** нечётное — убираем их все
    const stars = (line.match(/\*\*/g) || []).length;
    const normalized = stars % 2 !== 0 ? line.replace(/\*\*/g, "") : line;
    const parts = normalized.split(/(\*\*.*?\*\*)/g);
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
        const s = section.replace(/^\n+/, "");
        // Универсальный захват заголовка:
        // 1) "# 0) Вступление" / "## 1) Текст" / "###### 2) Текст"
        const titleMatchNumberWithHashes = s.match(/^#{0,6}\s*(\d{1,2})\)\s+(.*?)(\n|$)/);
        // 2) "0) Вступление" без решёток
        const titleMatchNumberPlain = s.match(/^(\d{1,2})\)\s+(.*?)(\n|$)/);
        // 3) "# Вступление" / "## Вступление"
        const titleMatchHash = s.match(/^#{1,6}\s+(.*?)(\n|$)/);
        let title = "";
        if (titleMatchNumberWithHashes) {
          title = `${titleMatchNumberWithHashes[1]}) ${titleMatchNumberWithHashes[2].trim()}`;
        } else if (titleMatchNumberPlain) {
          title = `${titleMatchNumberPlain[1]}) ${titleMatchNumberPlain[2].trim()}`;
        } else if (titleMatchHash) {
          // Убираем возможные ведущие "#", числа и скобку
          const t = titleMatchHash[1].trim().replace(/^#*\s*/, "");
          const numbered = t.match(/^(\d{1,2})\)\s+(.*)$/);
          title = numbered ? `${numbered[1]}) ${numbered[2].trim()}` : t;
        } else {
          // Фолбэк: берём первую непустую строку как заголовок
          const firstLine = s.split("\n").find(l => l.trim().length > 0) || `Пункт ${idx + 1}`;
          title = firstLine.replace(/^#{1,6}\s*/, "").replace(/^(\d{1,2})\)\s+/, "$1) ").trim();
        }
        // Скрыть служебный чек-лист "File Search выполнен"
        const normalizedTitle = title.replace(/^[#*\s✅\-]+/g, "").toLowerCase();
        if (normalizedTitle.startsWith("file search выполнен")) {
          return null;
        }
        const theme = sectionThemes[title] || { icon: Compass, accent: "bg-muted" };
        const Icon = theme.icon;

        const bodyLines = s
          // удаляем строку заголовка в любом из форматов
          .replace(/^#{0,6}\s*\d{1,2}\)\s.*?\n/, "")
          .replace(/^\d{1,2}\)\s.*?\n/, "")
          .replace(/^#{1,6}\s.*?\n/, "")
          .split("\n");
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

        for (let lineIdx = 0; lineIdx < bodyLines.length; lineIdx++) {
          const rawLine = bodyLines[lineIdx];
          // Нормализуем строку: убираем CR и фиксируем незакрытые ** (чтобы не светились звёздочки)
          let line = rawLine.replace(/\r/g, "").trim();
          const starPairs = (line.match(/\*\*/g) || []).length;
          if (starPairs % 2 !== 0) {
            line = line.replace(/\*\*/g, "");
          }
          if (!line) { continue; }

          // Разделы-подзаголовки в виде **Текст** или **Текст:**
          const headingBold = line.match(/^\*\*(.+?)\*\*\s*:?\s*$/u);
          if (headingBold) {
            flushList();
            contentNodes.push(
              <h3 key={`h3-${idx}-${lineIdx}`} className="text-lg font-semibold text-foreground">
                {headingBold[1]}
              </h3>
            );
            continue;
          }

          // Support various bullet marks: *, -, —, •
          if (line.startsWith("* ") || line.startsWith("- ") || line.startsWith("— ") || line.startsWith("• ")) {
            const item = line.replace(/^(\*|\-|—|•)\s/, "");
            listBuffer.push(parseLine(item));
            continue;
          }

          flushList();

          // Detect markdown tables and render as styled table
          if (line.startsWith("|")) {
            const tableLines: string[] = [];
            while (lineIdx < bodyLines.length && bodyLines[lineIdx].trim().startsWith("|")) {
              tableLines.push(bodyLines[lineIdx].trim());
              lineIdx++;
            }
            lineIdx--; // compensate last increment
            if (tableLines.length >= 2) {
              const header = tableLines[0]
                .split("|")
                .map((c) => c.trim())
                .filter((c) => c.length > 0);
              const body = tableLines.slice(1).filter((row) => !/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(row));
              const rows = body.map((row) =>
                row
                  .split("|")
                  .map((c) => c.trim())
                  .filter((c) => c.length > 0)
              );
              contentNodes.push(
                <table key={`mdtbl-${idx}-${lineIdx}`} className="w-full border-collapse rounded-xl overflow-hidden">
                  <thead>
                    <tr>
                      {header.map((h, i) => (
                        <th key={i} className="bg-muted/50 text-left text-sm font-semibold text-foreground px-3 py-2 border border-border">
                          {parseLine(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((cells, ri) => (
                      <tr key={ri} className="odd:bg-muted/20">
                        {cells.map((c, ci) => (
                          <td key={ci} className="text-sm text-muted-foreground px-3 py-2 align-top border border-border">
                            {parseLine(c)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
              continue;
            }
          }

          if (line.startsWith(">")) {
            contentNodes.push(
              <blockquote
                key={`quote-${idx}-${lineIdx}`}
                className="rounded-2xl border border-border bg-muted/50 p-4 text-sm italic text-muted-foreground"
              >
                {parseLine(line.replace(/^>\s?/, ""))}
              </blockquote>
            );
            continue;
          }

          // Auto-bold short key phrase before colon
          if (line.includes(":")) {
            const [head, ...restParts] = line.split(":");
            // Снимаем внешние ** у заголовка перед двоеточием, если они есть
            const headCleanRaw = head.trim();
            const headClean = headCleanRaw.replace(/^\*\*(.+)\*\*$/u, "$1").replace(/^\*\*/u, "").replace(/\*\*$/u, "");
            const tail = restParts.join(":").trim();
            if (headClean.length > 0 && headClean.length <= 40) {
              contentNodes.push(
                <p key={`p-${idx}-${lineIdx}`} className="text-sm leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">{headClean}: </span>
                  {parseLine(tail)}
                </p>
              );
              continue;
            }
          }

          contentNodes.push(
            <p key={`p-${idx}-${lineIdx}`} className="text-sm leading-relaxed text-muted-foreground">
              {parseLine(line)}
            </p>
          );
        }

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

  const handleSavePdf = async () => {
    if (!interpretationRef.current) return;
    // Берём живую разметку из секции (со всеми классами Tailwind/shadcn)
    const content = interpretationRef.current.innerHTML;
    const today = format(new Date(), "d MMMM yyyy 'г.'", { locale: ru });
    const titleHTML = `
      <div class="title-page">
        <div class="brand">
          <div class="logo-dot"></div>
          <div class="brand-text">Proteus</div>
        </div>
        <h1>Персональная интерпретация</h1>
        <p class="subtitle">Индивидуальный разбор на основе ваших данных</p>
        <div class="meta">
          <div><span>Имя</span><strong>${birthData.name}</strong></div>
          <div><span>Дата</span><strong>${format(new Date(birthData.date), "d MMMM yyyy 'г.'", { locale: ru })}</strong></div>
          <div><span>Время</span><strong>${birthData.time}</strong></div>
          <div><span>Локация</span><strong>${city.name}, ${city.country}</strong></div>
          <div><span>Сгенерировано</span><strong>${today}</strong></div>
        </div>
        <div class="title-footer">© Proteus — интеллектуальные консультации</div>
      </div>
    `;
    const styles = `
      <style>
        @page { size: A4; margin: 16mm; }
        :root { color-scheme: light; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Inter, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif; color:#0b0b0b; background:#ffffff; margin:0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        /* убираем фиксированные элементы во избежание обрезки */
        .content { margin: 0; padding: 0; }
        .container { 
          box-sizing: border-box;
          width: calc(100% - 6mm);
          max-width: 600px;
          padding: 0 3mm;
          margin: 0 auto;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        h2, h3 { margin: 0 0 10px; }
        h2 { font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
        h3 { font-size: 18px; font-weight: 600; letter-spacing: -0.01em; }
        p { margin: 0 0 10px; line-height: 1.6; font-size: 14px; }
        p, ul, ol, blockquote, article { page-break-inside: avoid; }
        ul, ol { margin: 8px 0 12px 18px; padding: 0 0 0 18px; }
        li { margin: 6px 0; }
        blockquote { margin: 12px 0; padding: 10px 12px; border-left: 3px solid #10b981; background: #f8fafc; color:#334155; }
        article { break-inside: avoid; page-break-inside: avoid; border: 1px solid #eef2f7; border-radius: 14px; padding: 14px 16px; margin-bottom: 16px; }
        .divider { height:1px; background:#f1f5f9; margin: 12px 0; }
        /* Title page */
        .title-page { height: calc(100vh - 36mm); display:flex; flex-direction:column; justify-content:center; align-items:flex-start; padding: 0 6mm; page-break-after: always; }
        .brand { display:flex; align-items:center; gap:10px; margin-bottom: 12px; }
        .logo-dot { width:14px; height:14px; border-radius:999px; background: linear-gradient(135deg, #0ea5e9, #10b981); box-shadow: 0 0 0 6px rgba(16,185,129,0.08); }
        .brand-text { font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color:#64748b; font-size:12px; }
        .title-page h1 { font-size: 36px; margin: 6px 0 8px; letter-spacing: -0.02em; }
        .title-page .subtitle { color:#64748b; margin-bottom: 18px; }
        .title-page .meta { display:grid; grid-template-columns: 1fr 1fr; gap:10px 18px; max-width: 420px; }
        .title-page .meta span { color:#94a3b8; font-size:12px; letter-spacing:.08em; text-transform:uppercase; display:block; }
        .title-page .meta strong { font-size:14px; }
        .title-footer { position:absolute; left:18mm; right:18mm; bottom: 24mm; color:#94a3b8; font-size:12px; }
      </style>
    `;
    // Более надёжно: печать через скрытый iframe (без popup-блокировок)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    // Тянем активные стили из текущей страницы (Tailwind/компоненты)
    const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');
    const pdfTitle = `ProteusAI - ${birthData.name}`;
    doc.open();
    doc.write('<!doctype html><html><head></head><body class="print-light"><div class="content"><div class="container"></div></div></body></html>');
    doc.close();
    try { (doc as Document).title = pdfTitle; } catch {}
    // inject styles and content
    try {
      const headEl = (doc as Document).head;
      const bodyContainer = (doc as Document).querySelector('.container') as HTMLDivElement;
      if (headEl) {
        const base = (doc as Document).createElement('base');
        base.href = location.origin;
        headEl.appendChild(base);
        headEl.innerHTML += headStyles + styles;
      }
      if (bodyContainer) {
        bodyContainer.innerHTML = titleHTML + content;
      }
    } catch {}
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => iframe.parentNode?.removeChild(iframe), 300);
    }, 200);
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copyState === 'success' ? 'Скопировано' : copyState === 'error' ? 'Ошибка копирования' : 'Скопировать'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSavePdf}>
              Сохранить PDF
            </Button>
          </div>
        </div>
        <div ref={interpretationRef}>
          <MarkdownContent text={interpretation} />
        </div>
      </section>
    </div>
  );
}