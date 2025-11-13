import { useState, useEffect, useRef } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, SkipBack, Sparkles, Heart, Brain, Moon, Bell } from "lucide-react";

type BreathingPhase = "inhale" | "hold" | "exhale" | "holdAfterExhale";

const phaseLabels: Record<BreathingPhase, string> = {
  inhale: "Вдох",
  hold: "Задержка",
  exhale: "Выдох",
  holdAfterExhale: "Задержка после выдоха",
};

const Meditation = () => {
  const [customInhale, setCustomInhale] = useState(4);
  const [customHold, setCustomHold] = useState(0);
  const [customExhale, setCustomExhale] = useState(6);
  const [customHoldAfter, setCustomHoldAfter] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(5);
  const [customPlaying, setCustomPlaying] = useState(false);
  const [customElapsed, setCustomElapsed] = useState(0);
  const [customPhase, setCustomPhase] = useState<BreathingPhase>("inhale");
  const [customPhaseRemaining, setCustomPhaseRemaining] = useState(4);
  const [customSound, setCustomSound] = useState(true);
  const [enableVoice, setEnableVoice] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission | null>(null);

  const customTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalCustomSeconds = Math.max(customMinutes * 60, 1);
  const voiceSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const notificationSupported = typeof window !== "undefined" && "Notification" in window;

  useEffect(() => {
    if (!notificationSupported) {
      setNotificationStatus(null);
      return;
    }
    setNotificationStatus(Notification.permission);
  }, [notificationSupported]);

  useEffect(() => {
    if (!voiceSupported) return;
    const synth = window.speechSynthesis;
    const handleVoicesChanged = () => {
      synth.getVoices();
    };
    synth.addEventListener?.("voiceschanged", handleVoicesChanged as any);
    synth.getVoices();

    return () => {
      synth.removeEventListener?.("voiceschanged", handleVoicesChanged as any);
    };
  }, [voiceSupported]);

  useEffect(() => {
    return () => {
      if (customTimerRef.current) {
        clearInterval(customTimerRef.current);
        customTimerRef.current = null;
      }
      if (voiceSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [voiceSupported]);

  useEffect(() => {
    if (customPlaying) return;
    let target = customInhale;
    if (customPhase === "hold") target = customHold;
    if (customPhase === "exhale") target = customExhale;
    if (customPhase === "holdAfterExhale") target = customHoldAfter;
    if (target !== customPhaseRemaining) {
      setCustomPhaseRemaining(target);
    }
  }, [customPlaying, customPhase, customInhale, customHold, customExhale, customHoldAfter, customPhaseRemaining]);

  useEffect(() => {
    if (!customPlaying && customElapsed > totalCustomSeconds) {
      setCustomElapsed(totalCustomSeconds);
    }
  }, [customPlaying, customElapsed, totalCustomSeconds]);

  const getRussianVoice = (): SpeechSynthesisVoice | null => {
    if (!voiceSupported) return null;
    const voices = window.speechSynthesis.getVoices();
    const ruVoices = voices.filter((v) => v.lang?.toLowerCase().startsWith("ru"));
    return ruVoices.find((v) => /female|woman|жен/i.test(v.name)) || ruVoices[0] || null;
  };

  const speakRu = (text: string) => {
    if (!voiceSupported || !enableVoice) return;
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ru-RU";
      const voice = getRussianVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  const playBeep = (frequency = 660, duration = 0.2) => {
    if (!customSound) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    } catch {}
  };

  const nextCustomPhase = () => {
    setCustomPhase((prev) => {
      if (prev === "inhale") {
        if (customHold > 0) {
          setCustomPhaseRemaining(customHold);
          speakRu(phaseLabels.hold);
          return "hold";
        }
        setCustomPhaseRemaining(customExhale);
        speakRu(phaseLabels.exhale);
        return "exhale";
      }
      if (prev === "hold") {
        setCustomPhaseRemaining(customExhale);
        speakRu(phaseLabels.exhale);
        return "exhale";
      }
      if (prev === "exhale") {
        if (customHoldAfter > 0) {
          setCustomPhaseRemaining(customHoldAfter);
          speakRu(phaseLabels.holdAfterExhale);
          return "holdAfterExhale";
        }
        setCustomPhaseRemaining(customInhale);
        speakRu(phaseLabels.inhale);
        return "inhale";
      }
      setCustomPhaseRemaining(customInhale);
      speakRu(phaseLabels.inhale);
      return "inhale";
    });
    playBeep(520, 0.12);
  };

  const startCustom = () => {
    if (customTimerRef.current) {
      clearInterval(customTimerRef.current);
      customTimerRef.current = null;
    }
    setCustomElapsed(0);
    setCustomPhase("inhale");
    setCustomPhaseRemaining(customInhale);
    setCustomPlaying(true);
    playBeep(440, 0.2);
    speakRu(phaseLabels.inhale);

    customTimerRef.current = setInterval(() => {
      setCustomElapsed((prev) => {
        if (prev >= totalCustomSeconds) {
          setCustomPlaying(false);
          if (customTimerRef.current) {
            clearInterval(customTimerRef.current);
            customTimerRef.current = null;
          }
          [600, 760, 920].forEach((frequency, index) => {
            setTimeout(() => playBeep(frequency, 0.15), index * 220);
          });
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            new Notification("Медитация завершена 🧘‍♀️", {
              body: "Вы завершили настраиваемую дыхательную практику.",
              icon: "/favicon.ico",
            });
          }
          return totalCustomSeconds;
        }
        return prev + 1;
      });
      setCustomPhaseRemaining((prev) => {
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
    if (customTimerRef.current) {
      clearInterval(customTimerRef.current);
      customTimerRef.current = null;
    }
    if (voiceSupported) {
      window.speechSynthesis.cancel();
    }
  };

  const stopCustom = () => {
    setCustomPlaying(false);
    if (customTimerRef.current) {
      clearInterval(customTimerRef.current);
      customTimerRef.current = null;
    }
    setCustomElapsed(0);
    setCustomPhase("inhale");
    setCustomPhaseRemaining(customInhale);
    if (voiceSupported) {
      window.speechSynthesis.cancel();
    }
  };

  const handleRequestNotification = () => {
    if (!notificationSupported) return;
    Notification.requestPermission()
      .then((permission) => setNotificationStatus(permission))
      .catch(() => setNotificationStatus(Notification.permission));
  };

  const formattedElapsed = `${Math.floor(customElapsed / 60)}:${(customElapsed % 60).toString().padStart(2, "0")}`;
  const formattedTotal = `${Math.floor(totalCustomSeconds / 60)}:${(totalCustomSeconds % 60).toString().padStart(2, "0")}`;
  const progressValue = Math.min((customElapsed / totalCustomSeconds) * 100, 100);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-r from-rose-50 via-sky-50 to-emerald-50 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
        <div className="absolute -top-24 -left-20 h-64 w-64 rounded-full bg-gradient-to-tr from-rose-300/30 to-pink-300/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-gradient-to-tr from-sky-300/30 to-cyan-300/30 blur-3xl" />
        <div className="relative text-center">
          <div className="inline-flex items-center space-x-3 bg-white/70 text-slate-900 ring-1 ring-black/5 px-6 py-3 rounded-full mb-4 backdrop-blur-md">
            <Sparkles className="w-6 h-6 text-slate-700" />
            <span className="text-lg font-semibold">Дыхательная медитация</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Настройте дыхание под себя</h1>
          <p className="text-slate-700 mt-3 text-lg max-w-2xl mx-auto">
            Сформируйте собственный ритуал спокойствия: задайте длительность фаз, включите звук и голосовые подсказки, следуйте за мягким ритмом дыхания.
          </p>
        </div>
      </div>

      <div className="relative bg-gradient-to-r from-slate-50 to-stone-50 border border-slate-200 rounded-2xl p-6">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full flex items-center justify-center ring-1 ring-white/50">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <CardTitle className="text-2xl text-gray-800">Настраиваемая дыхательная медитация</CardTitle>
                <CardDescription className="text-slate-600">Подберите длительность фаз, звук и голосовое сопровождение</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">Вдох (сек)</div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={customInhale}
                  onChange={(e) => setCustomInhale(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Задержка (после вдоха)</div>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={customHold}
                  onChange={(e) => setCustomHold(Math.max(0, Math.min(30, Number(e.target.value) || 0)))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Выдох (сек)</div>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={customExhale}
                  onChange={(e) => setCustomExhale(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Задержка (после выдоха)</div>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={customHoldAfter}
                  onChange={(e) => setCustomHoldAfter(Math.max(0, Math.min(30, Number(e.target.value) || 0)))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Длительность (мин)</div>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white/60 px-3 py-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={customSound} onChange={(e) => setCustomSound(e.target.checked)} className="h-4 w-4" />
                  Звуковой сигнал
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={enableVoice} onChange={(e) => setEnableVoice(e.target.checked)} className="h-4 w-4" />
                  Голосовые подсказки (RU)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="text-center">
                <div className="text-sm text-slate-600 mb-1">Фаза</div>
                <div className="text-2xl font-semibold">{phaseLabels[customPhase]}</div>
                <div className="text-slate-500 mt-1">{Math.max(0, customPhaseRemaining)} сек</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-600 mb-1">Прогресс</div>
                <div className="text-lg text-slate-700">
                  {formattedElapsed} / {formattedTotal}
                </div>
                <Progress value={progressValue} className="h-3 mt-2" />
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

      <div className="bg-gradient-to-r from-rose-50 via-sky-50 to-emerald-50 border border-white/50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Преимущества регулярной практики</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Brain, title: "Концентрация", description: "Улучшение внимания и ясности" },
            { icon: Heart, title: "Стресс", description: "Снижение тревожности и напряжения" },
            { icon: Moon, title: "Сон", description: "Глубокий отдых и восстановление" },
            { icon: Sparkles, title: "Баланс", description: "Эмоциональная стабильность" },
          ].map((benefit, index) => (
            <div key={index} className="text-center transform transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-sky-300 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-white/50">
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-rose-50 via-sky-50 to-emerald-50 border border-white/50 rounded-2xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-sky-300 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-white/50">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🔔 Уведомления о завершении</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Получайте уведомления о завершении медитации, чтобы мягко вернуться к делам.</p>
          {notificationSupported ? (
            <>
              {notificationStatus === "default" && (
                <Button onClick={handleRequestNotification} className="bg-gradient-to-r from-sky-400 to-cyan-400 hover:opacity-95 text-white px-8 py-3">
                  <Bell className="w-4 h-4 mr-2" /> Разрешить уведомления
                </Button>
              )}
              {notificationStatus === "granted" && (
                <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium">Уведомления включены</span>
                </div>
              )}
              {notificationStatus === "denied" && (
                <div className="inline-flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium">Уведомления отключены в настройках браузера</span>
                </div>
              )}
              {notificationStatus === null && (
                <div className="text-sm text-gray-500">Настройки уведомлений появятся после загрузки страницы.</div>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-500">Ваш браузер не поддерживает веб-уведомления.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Meditation;


