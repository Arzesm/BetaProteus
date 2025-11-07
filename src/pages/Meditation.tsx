import { useState, useEffect, useRef } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, SkipBack, Timer, Sparkles, Heart, Brain, Moon, Bell } from "lucide-react";

interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: 'beginner' | 'intermediate' | 'advanced';
  type: 'breathing' | 'mindfulness' | 'sleep' | 'focus' | 'relaxation';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isPlaying: boolean;
  progress: number;
  instructions: string[];
  breathingPattern?: {
    inhale: number;
    hold: number;
    exhale: number;
    holdAfterExhale: number;
  };
}

const Meditation = () => {
  const [currentSession, setCurrentSession] = useState<MeditationSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const instructionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const preStartRef = useRef<NodeJS.Timeout | null>(null);
  const [preStartCountdown, setPreStartCountdown] = useState<number | null>(null);
  const [instructionPhase, setInstructionPhase] = useState(false);
  const [enableVoice, setEnableVoice] = useState(true);
  const lastPhaseRef = useRef<string | null>(null);
  const voicesLoadedRef = useRef(false);

  // Filters
  const [activeType, setActiveType] = useState<'all' | MeditationSession['type']>('all');
  const [activeLevel, setActiveLevel] = useState<'all' | MeditationSession['category']>('all');

  // Customizable breathing meditation
  const [customInhale, setCustomInhale] = useState(4);
  const [customHold, setCustomHold] = useState(0);
  const [customExhale, setCustomExhale] = useState(6);
  const [customHoldAfter, setCustomHoldAfter] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(5);
  const [customPlaying, setCustomPlaying] = useState(false);
  const [customElapsed, setCustomElapsed] = useState(0);
  const [customPhase, setCustomPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdAfterExhale'>('inhale');
  const [customPhaseRemaining, setCustomPhaseRemaining] = useState(4);
  const customTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [customSound, setCustomSound] = useState(true);

  const meditationSessions: MeditationSession[] = [
    {
      id: "1",
      title: "Дыхание 4-7-8",
      description: "Глубокое дыхание для расслабления и снижения стресса",
      duration: 5,
      category: "beginner",
      type: "breathing",
      icon: Heart,
      color: "from-rose-300 to-pink-400",
      isPlaying: false,
      progress: 0,
      instructions: [
        "Сядьте удобно, выпрямив спину",
        "Положите кончик языка на нёбо за верхними зубами",
        "Вдохните через нос на 4 счета",
        "Задержите дыхание на 7 счетов",
        "Выдохните через рот на 8 счетов",
        "Повторите цикл"
      ],
      breathingPattern: {
        inhale: 4,
        hold: 7,
        exhale: 8,
        holdAfterExhale: 0
      }
    },
    {
      id: "2",
      title: "Медитация осознанности",
      description: "Практика присутствия в моменте и мягкой внимательности",
      duration: 10,
      category: "beginner",
      type: "mindfulness",
      icon: Brain,
      color: "from-sky-300 to-cyan-400",
      isPlaying: false,
      progress: 0,
      instructions: [
        "Сядьте в удобной позе, закройте глаза",
        "Сосредоточьтесь на естественном дыхании",
        "Наблюдайте за вдохом и выдохом",
        "Мысли отвлекли — мягко возвращайтесь к дыханию",
        "Не оценивайте мысли, просто наблюдайте",
        "Практикуйте принятие настоящего момента"
      ]
    },
    {
      id: "3",
      title: "Медитация для сна",
      description: "Расслабляющая практика для глубокоого спокойного сна",
      duration: 15,
      category: "beginner",
      type: "sleep",
      icon: Moon,
      color: "from-indigo-300 to-violet-400",
      isPlaying: false,
      progress: 0,
      instructions: [
        "Лягте в удобной позе",
        "Расслабьте все мышцы",
        "Представьте, как напряжение покидает тело",
        "Сосредоточьтесь на медленном дыхании",
        "Визуализируйте спокойное место",
        "Позвольте себе уснуть"
      ]
    },
    {
      id: "4",
      title: "Концентрация внимания",
      description: "Упражнения для мягкого фокуса и ясности ума",
      duration: 20,
      category: "intermediate",
      type: "focus",
      icon: Brain,
      color: "from-emerald-300 to-teal-400",
      isPlaying: false,
      progress: 0,
      instructions: [
        "Сядьте прямо, закройте глаза",
        "Выберите объект внимания",
        "Сосредоточьтесь на нём",
        "Возвращайтесь мягко при отвлечении",
        "Постепенно увеличивайте длительность",
        "Развивайте устойчивость внимания"
      ]
    },
    {
      id: "5",
      title: "Прогрессивная релаксация",
      description: "Постепенное расслабление всего тела",
      duration: 25,
      category: "intermediate",
      type: "relaxation",
      icon: Heart,
      color: "from-amber-300 to-orange-400",
      isPlaying: false,
      progress: 0,
      instructions: [
        "Лягте на спину",
        "Напрягите и расслабьте по очереди группы мышц",
        "Продвигайтесь от ног к голове",
        "Сохраняйте плавное дыхание",
        "Ощутите общее расслабление",
        "Оставайтесь в покое"
      ]
    },
    {
      id: "6",
      title: "Любящая доброта",
      description: "Практика доброжелательности к себе и другим",
      duration: 30,
      category: "advanced",
      type: "mindfulness",
      icon: Heart,
      color: "from-fuchsia-300 to-rose-400",
      isPlaying: false,
      progress: 0,
      instructions: [
        "Сядьте удобно",
        "Пожелайте счастья себе",
        "Расширьте пожелания на близких",
        "Включите знакомых и незнакомых",
        "Добавьте тех, с кем конфликт",
        "Почувствуйте тепло и принятие"
      ]
    }
  ];

  const startSession = (session: MeditationSession) => {
    setCurrentSession(session);
    setTotalTime(session.duration * 60);
    setCurrentTime(0);
    setIsPlaying(false);
    setShowInstructions(true);
    setCurrentInstruction(0);
    setInstructionPhase(true);

    // Start chime
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
      } catch {}
    }

    // Запуск начнётся после подтверждения на экране инструкций
  };

  const beginAfterInstructions = () => {
    // скрываем инструкции и запускаем престарт, затем — сессию
    setInstructionPhase(false);
    setShowInstructions(false);
    if (preStartRef.current) clearInterval(preStartRef.current);
    setPreStartCountdown(3);
    preStartRef.current = setInterval(() => {
      setPreStartCountdown(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (preStartRef.current) clearInterval(preStartRef.current);
          setIsPlaying(true);
          return null;
        }
        return (prev || 0) - 1;
      });
    }, 1000);
  };

  const pauseSession = () => {
    setIsPlaying(false);
  };

  const resumeSession = () => {
    setIsPlaying(true);
  };

  const stopSession = () => {
    setCurrentSession(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setTotalTime(0);
    setShowInstructions(false);
    setCurrentInstruction(0);
    setPreStartCountdown(null);
    if (preStartRef.current) clearInterval(preStartRef.current);
    setInstructionPhase(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    return 'bg-white/70 text-slate-800 ring-1 ring-black/5';
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'beginner': return 'Начинающий';
      case 'intermediate': return 'Средний';
      case 'advanced': return 'Продвинутый';
      default: return 'Неизвестно';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'breathing': return <Heart className="w-5 h-5" />;
      case 'mindfulness': return <Brain className="w-5 h-5" />;
      case 'sleep': return <Moon className="w-5 h-5" />;
      case 'focus': return <Brain className="w-5 h-5" />;
      case 'relaxation': return <Heart className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  // --- Voice (ru-RU) helpers ---
  const getRussianVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    // Prefer female if available
    const ruVoices = voices.filter(v => v.lang?.toLowerCase().startsWith('ru'));
    const preferred = ruVoices.find(v => /female|woman|жен/i.test(v.name)) || ruVoices[0];
    return preferred || null;
  };

  const speakRu = (text: string) => {
    if (!enableVoice || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ru-RU';
      const v = getRussianVoice();
      if (v) utter.voice = v;
      utter.rate = 0.95;
      utter.pitch = 1.0;
      utter.volume = 0.9;
      // Avoid overlapping
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch {}
  };

  // Ensure voices are loaded (Chrome loads async)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const onVoices = () => { voicesLoadedRef.current = true; };
    synth.addEventListener?.('voiceschanged', onVoices as any);
    // Trigger load
    synth.getVoices();
    return () => {
      synth.removeEventListener?.('voiceschanged', onVoices as any);
    };
  }, []);

  // Derive breathing phase for preset sessions with breathingPattern
  const getSessionBreathingPhase = (session: MeditationSession | null, elapsedSec: number): { label: string; remaining: number; total: number; parts: { key: string; len: number }[] } | null => {
    if (!session || !session.breathingPattern) return null;
    const { inhale, hold, exhale, holdAfterExhale } = session.breathingPattern;
    const cycle = [
      { key: 'inhale', len: inhale, label: 'Вдох' },
      { key: 'hold', len: hold, label: 'Задержка' },
      { key: 'exhale', len: exhale, label: 'Выдох' },
      { key: 'holdAfterExhale', len: holdAfterExhale, label: 'Задержка после выдоха' },
    ].filter(p => p.len > 0);
    const total = cycle.reduce((a, b) => a + b.len, 0) || 1;
    const t = total === 0 ? 0 : elapsedSec % total;
    let acc = 0;
    for (const part of cycle) {
      if (t < acc + part.len) {
        const remaining = Math.max(1, Math.ceil(acc + part.len - t));
        return {
          label: part.label,
          remaining,
          total,
          parts: cycle.map(p => ({ key: p.key, len: p.len })),
        };
      }
      acc += part.len;
    }
    return null;
  };

  const nextInstruction = () => {
    if (currentSession && currentInstruction < currentSession.instructions.length - 1) {
      setCurrentInstruction(prev => prev + 1);
    }
  };

  const previousInstruction = () => {
    if (currentInstruction > 0) {
      setCurrentInstruction(prev => prev - 1);
    }
  };

  // Main session timer
  useEffect(() => {
    if (isPlaying && currentTime < totalTime) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalTime) {
            setIsPlaying(false);

            // End melody
            if ('AudioContext' in window || 'webkitAudioContext' in window) {
              try {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const notes = [523, 659, 784];
                notes.forEach((freq, index) => {
                  const noteOsc = audioContext.createOscillator();
                  const noteGain = audioContext.createGain();
                  noteOsc.connect(noteGain);
                  noteGain.connect(audioContext.destination);
                  noteOsc.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.2);
                  noteOsc.type = 'sine';
                  noteGain.gain.setValueAtTime(0.08, audioContext.currentTime + index * 0.2);
                  noteGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.2 + 0.3);
                  noteOsc.start(audioContext.currentTime + index * 0.2);
                  noteOsc.stop(audioContext.currentTime + index * 0.2 + 0.3);
                });
              } catch {}
            }

            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Медитация завершена! 🧘‍♀️', {
                body: `Поздравляем! Вы завершили "${currentSession?.title}"`,
                icon: '/favicon.ico'
              });
            }
            return totalTime;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (!isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentTime, totalTime, currentSession]);

  // Auto-advance instructions while playing
  useEffect(() => {
    // Clear any previous interval
    if (instructionIntervalRef.current) clearInterval(instructionIntervalRef.current);

    if (isPlaying && currentSession && showInstructions) {
      // Advance every 8 seconds until the last instruction
      instructionIntervalRef.current = setInterval(() => {
        setCurrentInstruction(prev => {
          const lastIndex = (currentSession?.instructions.length || 1) - 1;
          return prev < lastIndex ? prev + 1 : lastIndex;
        });
      }, 8000);
    }

    return () => {
      if (instructionIntervalRef.current) clearInterval(instructionIntervalRef.current);
    };
  }, [isPlaying, currentSession, showInstructions]);

  // Voice announcements for preset sessions with breathingPattern
  useEffect(() => {
    if (!isPlaying || preStartCountdown !== null) return;
    if (!currentSession || !currentSession.breathingPattern) return;
    const phase = getSessionBreathingPhase(currentSession, currentTime);
    if (!phase) return;
    const label = phase.label;
    if (lastPhaseRef.current !== label) {
      lastPhaseRef.current = label;
      if (enableVoice) speakRu(label.toUpperCase());
    }
  }, [isPlaying, currentSession, currentTime, preStartCountdown, enableVoice]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (customTimerRef.current) clearInterval(customTimerRef.current);
      if (preStartRef.current) clearInterval(preStartRef.current);
    };
  }, []);

  // Custom breathing logic
  const totalCustomSeconds = customMinutes * 60;

  const playBeep = (freq = 660, duration = 0.2) => {
    if (!customSound) return;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  const nextCustomPhase = () => {
    setCustomPhase(prev => {
      if (prev === 'inhale') {
        if (customHold > 0) {
          setCustomPhaseRemaining(customHold);
          if (enableVoice) speakRu('Задержка');
          return 'hold';
        } else {
          setCustomPhaseRemaining(customExhale);
          if (enableVoice) speakRu('Выдох');
          return 'exhale';
        }
      } else if (prev === 'hold') {
        setCustomPhaseRemaining(customExhale);
        if (enableVoice) speakRu('Выдох');
        return 'exhale';
      } else if (prev === 'exhale') {
        if (customHoldAfter > 0) {
          setCustomPhaseRemaining(customHoldAfter);
          if (enableVoice) speakRu('Задержка');
          return 'holdAfterExhale';
        } else {
          setCustomPhaseRemaining(customInhale);
          if (enableVoice) speakRu('Вдох');
          return 'inhale';
        }
      } else {
        setCustomPhaseRemaining(customInhale);
        if (enableVoice) speakRu('Вдох');
        return 'inhale';
      }
    });
    playBeep(520, 0.12);
  };

  const startCustom = () => {
    setCurrentSession(null);
    setCustomElapsed(0);
    setCustomPhase('inhale');
    setCustomPhaseRemaining(customInhale);
    setCustomPlaying(true);
    playBeep(440, 0.2);
    if (enableVoice) speakRu('Вдох');
    if (customTimerRef.current) clearInterval(customTimerRef.current);
    customTimerRef.current = setInterval(() => {
      setCustomElapsed(prev => {
        if (prev >= totalCustomSeconds) {
          setCustomPlaying(false);
          if (customTimerRef.current) clearInterval(customTimerRef.current);
          [600, 760, 920].forEach((f, i) => setTimeout(() => playBeep(f, 0.15), i * 220));
          return totalCustomSeconds;
        }
        return prev + 1;
      });
      setCustomPhaseRemaining(prev => {
        if (prev <= 1) {
          nextCustomPhase();
          return prev;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseCustom = () => {
    setCustomPlaying(false);
    if (customTimerRef.current) clearInterval(customTimerRef.current);
  };

  const resumeCustom = () => {
    if (customPlaying) return;
    setCustomPlaying(true);
    customTimerRef.current = setInterval(() => {
      setCustomElapsed(prev => {
        if (prev >= totalCustomSeconds) {
          setCustomPlaying(false);
          if (customTimerRef.current) clearInterval(customTimerRef.current);
          return totalCustomSeconds;
        }
        return prev + 1;
      });
      setCustomPhaseRemaining(prev => {
        if (prev <= 1) {
          nextCustomPhase();
          return prev;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCustom = () => {
    setCustomPlaying(false);
    if (customTimerRef.current) clearInterval(customTimerRef.current);
    setCustomElapsed(0);
    setCustomPhase('inhale');
    setCustomPhaseRemaining(customInhale);
  };

  const filteredSessions = meditationSessions.filter(s =>
    (activeType === 'all' || s.type === activeType) && (activeLevel === 'all' || s.category === activeLevel)
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-r from-rose-50 via-sky-50 to-emerald-50 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
        <div className="absolute -top-24 -left-20 h-64 w-64 rounded-full bg-gradient-to-tr from-rose-300/30 to-pink-300/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-gradient-to-tr from-sky-300/30 to-cyan-300/30 blur-3xl" />
        <div className="relative text-center">
          <div className="inline-flex items-center space-x-3 bg-white/70 text-slate-900 ring-1 ring-black/5 px-6 py-3 rounded-full mb-4 backdrop-blur-md">
            <Sparkles className="w-6 h-6 text-slate-700" />
            <span className="text-lg font-semibold">Медитации</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Цвет и спокойствие</h1>
          <p className="text-slate-700 mt-3 text-lg max-w-2xl mx-auto">
            Выберите практику, настройте дыхание и следуйте мягкому ритму с визуальными и звуковыми подсказками
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {([
          { key: 'all', label: 'Все' },
          { key: 'breathing', label: 'Дыхание' },
          { key: 'mindfulness', label: 'Осознанность' },
          { key: 'sleep', label: 'Сон' },
          { key: 'focus', label: 'Фокус' },
          { key: 'relaxation', label: 'Релаксация' },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setActiveType(f.key as any)}
            className={`rounded-full px-4 py-2 text-sm transition-all ${activeType === f.key ? 'bg-gradient-to-r from-sky-400 to-cyan-400 text-white shadow-sm' : 'bg-white/70 text-slate-800 ring-1 ring-black/5 backdrop-blur'} `}
          >
            {f.label}
          </button>
        ))}
        <span className="mx-2 text-slate-400">•</span>
        {([
          { key: 'all', label: 'Любой уровень' },
          { key: 'beginner', label: 'Начинающий' },
          { key: 'intermediate', label: 'Средний' },
          { key: 'advanced', label: 'Продвинутый' },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setActiveLevel(f.key as any)}
            className={`rounded-full px-4 py-2 text-sm transition-all ${activeLevel === f.key ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-sm' : 'bg-white/70 text-slate-800 ring-1 ring-black/5 backdrop-blur'} `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Current session with animated breathing visual */}
      {currentSession && (
        <div className="relative bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${currentSession.color} rounded-full flex items-center justify-center ring-1 ring-white/50`}>
                  <currentSession.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-2xl text-gray-800">{currentSession.title}</CardTitle>
                    {isPlaying && (
                      <div className="flex items-center space-x-1 text-emerald-600 opacity-80">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm font-medium">В процессе</span>
                      </div>
                    )}
                  </div>
                  <CardDescription className="text-slate-600">{currentSession.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* If instruction phase: show full instruction card with Start CTA */}
              {instructionPhase ? (
                <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 border border-slate-200">
                  <h4 className="text-lg font-semibold text-slate-900 text-center mb-4">Перед началом</h4>
                  <ul className="space-y-2 text-slate-700 max-w-2xl mx-auto list-disc list-inside">
                    {currentSession.instructions.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-center gap-4 mt-6 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2"><Timer className="w-4 h-4" /> ~{currentSession.duration} мин</span>
                    <span>•</span>
                    <span>{getCategoryText(currentSession.category)}</span>
                  </div>
                  <div className="flex justify-center mt-6">
                    <Button onClick={beginAfterInstructions} className={`px-8 py-6 text-base bg-gradient-to-r ${currentSession.color} text-white`}>
                      Я готов — начать медитацию
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Animated breathing circle and timer + guidance panel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="relative h-40 w-40 md:h-48 md:w-48 mx-auto">
                      <div
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentSession.color} opacity-90`}
                        style={{
                          transform: `scale(${isPlaying ? 1 + 0.1 * Math.sin((currentTime % 6) / 6 * Math.PI * 2) : 1})`,
                          transition: 'transform 0.4s ease',
                        }}
                      />
                      <div className="absolute inset-2 rounded-full bg-white/70 backdrop-blur-sm ring-1 ring-white/50 flex items-center justify-center">
                        {preStartCountdown !== null ? (
                          <div className="text-center">
                            <div className="text-xs text-slate-600 mb-1">Подготовьтесь</div>
                            <div className="text-3xl font-semibold text-slate-900">{preStartCountdown}</div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="text-xs text-slate-600 mb-1">Время</div>
                            <div className="text-xl font-semibold text-slate-800">{formatTime(currentTime)} / {formatTime(totalTime)}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full">
                      {(() => {
                        const phase = getSessionBreathingPhase(currentSession, currentTime);
                        const tips = [
                          'Дышите мягко и без усилий',
                          'Расслабьте плечи и челюсть',
                          'Позвольте выдоху быть длиннее',
                          'Если отвлеклись — мягко вернитесь к дыханию',
                        ];
                        const tip = tips[Math.floor(currentTime / 10) % tips.length];
                        return (
                          <div className="bg-white/80 border border-slate-200 rounded-2xl p-5 backdrop-blur">
                            {phase ? (
                              <>
                                <div className="flex items-baseline justify-between">
                                  <div className="text-lg font-semibold text-slate-900">{phase.label}</div>
                                  <div className="text-sm text-slate-600">{phase.remaining} сек</div>
                                </div>
                                <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
                                  {phase.parts.map((p, i) => (
                                    <div
                                      key={i}
                                      className={`h-full ${p.key === 'inhale' ? 'bg-emerald-300/70' : p.key === 'exhale' ? 'bg-sky-300/70' : 'bg-slate-300/70'}`}
                                      style={{ width: `${(p.len / (phase.total || 1)) * 100}%` }}
                                    />
                                  ))}
                                </div>
                                <div className="mt-4 text-sm text-slate-600">{tip}</div>
                              </>
                            ) : (
                              <>
                                <div className="text-lg font-semibold text-slate-900">Сохраняйте мягкий фокус</div>
                                <div className="mt-2 text-sm text-slate-600">{tip}</div>
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Progress + controls */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Прогресс</span>
                      <span>{formatTime(currentTime)} / {formatTime(totalTime)}</span>
                    </div>
                    <Progress value={(currentTime / totalTime) * 100} className="h-3" />
                    <div className="flex items-center gap-3 pt-1">
                      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={enableVoice} onChange={(e) => setEnableVoice(e.target.checked)} className="h-4 w-4" />
                        Голосовые подсказки (RU)
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" size="lg" onClick={stopSession} className="px-6">
                      <SkipBack className="w-5 h-5 mr-2" /> Остановить
                    </Button>
                    {isPlaying ? (
                      <Button size="lg" onClick={pauseSession} className={`bg-gradient-to-r ${currentSession.color} text-white px-8`}>
                        <Pause className="w-5 h-5 mr-2" /> Пауза
                      </Button>
                    ) : (
                      <Button size="lg" onClick={resumeSession} className={`bg-gradient-to-r ${currentSession.color} text-white px-8`}>
                        <Play className="w-5 h-5 mr-2" /> Продолжить
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Выберите медитацию</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <div key={session.id} className="group relative">
              <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r ${session.color} opacity-80 blur-[2px] transition-opacity duration-300 group-hover:opacity-100`} />
              <Card className="relative h-full overflow-hidden rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-300 group-hover:shadow-[0_16px_38px_rgba(0,0,0,0.10)] group-hover:-translate-y-0.5">
                <div className="pointer-events-none absolute inset-x-0 -top-24 h-40 bg-gradient-to-b from-white/50 to-transparent" />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 bg-gradient-to-r ${session.color} rounded-xl flex items-center justify-center ring-1 ring-white/40 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                      <session.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-[11px] font-medium text-gray-700 ring-1 ring-black/5">
                        <Timer className="w-3.5 h-3.5 text-gray-500" /> {session.duration} мин
                      </span>
                      <Badge className={`${getCategoryColor(session.category)} bg-white/70 ring-1 ring-black/5`}>{getCategoryText(session.category)}</Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg text-gray-900 tracking-tight">{session.title}</CardTitle>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">{session.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="inline-flex items-center gap-1.5">
                      {getTypeIcon(session.type)}
                      <span className="text-gray-600 capitalize">
                        {session.type === 'breathing' ? 'дыхание' : session.type === 'mindfulness' ? 'осознанность' : session.type === 'sleep' ? 'сон' : session.type === 'focus' ? 'фокус' : 'релаксация'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button onClick={() => startSession(session)} className={`w-full bg-gradient-to-r ${session.color} hover:opacity-95 text-white transition-all duration-300 group-hover:translate-y-[-1px]`}>
                      <Play className="w-4 h-4 mr-2" /> Начать
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentSession(session);
                        setShowInstructions(true);
                        setCurrentInstruction(0);
                      }}
                      className="w-full text-sm border-white/60 bg-white/60 backdrop-blur-md hover:bg-white"
                    >
                      📖 Инструкции
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Custom breathing */}
      <div className="relative bg-gradient-to-r from-slate-50 to-stone-50 border border-slate-200 rounded-2xl p-6">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full flex items-center justify-center ring-1 ring-white/50">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <CardTitle className="text-2xl text-gray-800">Настраиваемая дыхательная медитация</CardTitle>
                <CardDescription className="text-slate-600">Выберите длительность фаз и звуковые сигналы</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">Вдох (сек)</div>
                <input type="number" min={1} max={20} value={customInhale} onChange={(e) => setCustomInhale(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} className="w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Задержка (после вдоха)</div>
                <input type="number" min={0} max={30} value={customHold} onChange={(e) => setCustomHold(Math.max(0, Math.min(30, Number(e.target.value) || 0)))} className="w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Выдох (сек)</div>
                <input type="number" min={1} max={30} value={customExhale} onChange={(e) => setCustomExhale(Math.max(1, Math.min(30, Number(e.target.value) || 1)))} className="w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Задержка (после выдоха)</div>
                <input type="number" min={0} max={30} value={customHoldAfter} onChange={(e) => setCustomHoldAfter(Math.max(0, Math.min(30, Number(e.target.value) || 0)))} className="w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Длительность (мин)</div>
                <input type="number" min={1} max={60} value={customMinutes} onChange={(e) => setCustomMinutes(Math.max(1, Math.min(60, Number(e.target.value) || 1)))} className="w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <label className="flex items-center space-x-2 mt-6 md:mt-0">
                <input type="checkbox" checked={customSound} onChange={(e) => setCustomSound(e.target.checked)} className="h-4 w-4" />
                <span className="text-sm text-gray-700">Звуковой сигнал</span>
              </label>
            </div>

            {/* Phase + progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="text-center">
                <div className="text-sm text-slate-600 mb-1">Фаза</div>
                <div className="text-2xl font-semibold">
                  {customPhase === 'inhale' && 'Вдох'}
                  {customPhase === 'hold' && 'Задержка'}
                  {customPhase === 'exhale' && 'Выдох'}
                  {customPhase === 'holdAfterExhale' && 'Задержка после выдоха'}
                </div>
                <div className="text-slate-500 mt-1">{customPhaseRemaining} сек</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-600 mb-1">Прогресс</div>
                <div className="text-lg text-slate-700">{Math.floor(customElapsed / 60)}:{(customElapsed % 60).toString().padStart(2, '0')} / {Math.floor(totalCustomSeconds / 60)}:{(totalCustomSeconds % 60).toString().padStart(2, '0')}</div>
                <Progress value={(customElapsed / totalCustomSeconds) * 100} className="h-3 mt-2" />
              </div>
              <div className="flex justify-center space-x-3">
                {!customPlaying ? (
                  <Button onClick={startCustom} className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white px-8">
                    <Play className="w-5 h-5 mr-2" /> Старт
                  </Button>
                ) : (
                  <Button onClick={pauseCustom} className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white px-8">
                    <Pause className="w-5 h-5 mr-2" /> Пауза
                  </Button>
                )}
                <Button variant="outline" onClick={stopCustom} className="border-white/60 bg-white/60 backdrop-blur-md hover:bg-white">
                  <SkipBack className="w-5 h-5 mr-2" /> Сброс
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits */}
      <div className="bg-gradient-to-r from-rose-50 via-sky-50 to-emerald-50 border border-white/50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Преимущества регулярной практики</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Brain, title: 'Концентрация', description: 'Улучшение внимания и ясности' },
            { icon: Heart, title: 'Стресс', description: 'Снижение тревожности и напряжения' },
            { icon: Moon, title: 'Сон', description: 'Глубокий отдых и восстановление' },
            { icon: Sparkles, title: 'Баланс', description: 'Эмоциональная стабильность' },
          ].map((benefit, i) => (
            <div key={i} className="text-center transform transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-sky-300 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-white/50">
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-gradient-to-r from-rose-50 via-sky-50 to-emerald-50 border border-white/50 rounded-2xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-sky-300 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-white/50">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🔔 Уведомления о завершении</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Получайте уведомления о завершении медитации, чтобы мягко вернуться к делам</p>
          {Notification.permission === 'default' && (
            <Button onClick={() => Notification.requestPermission()} className="bg-gradient-to-r from-sky-400 to-cyan-400 hover:opacity-95 text-white px-8 py-3">
              <Bell className="w-4 h-4 mr-2" /> Разрешить уведомления
            </Button>
          )}
          {Notification.permission === 'granted' && (
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm font-medium">Уведомления включены</span>
            </div>
          )}
          {Notification.permission === 'denied' && (
            <div className="inline-flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-sm font-medium">Уведомления отключены</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Meditation;
