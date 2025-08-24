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

  const meditationSessions: MeditationSession[] = [
    {
      id: "1",
      title: "Дыхание 4-7-8",
      description: "Техника глубокого дыхания для мгновенного расслабления и снятия стресса",
      duration: 5,
      category: "beginner",
      type: "breathing",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
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
      description: "Практика присутствия в моменте для развития внимательности и спокойствия",
      duration: 10,
      category: "beginner",
      type: "mindfulness",
      icon: Brain,
      color: "from-blue-500 to-cyan-500",
      isPlaying: false,
      progress: 0,
      instructions: [
        "Сядьте в удобной позе, закройте глаза",
        "Сосредоточьтесь на естественном дыхании",
        "Наблюдайте за вдохом и выдохом",
        "Когда мысли отвлекают, мягко возвращайтесь к дыханию",
        "Не оценивайте мысли, просто наблюдайте",
        "Практикуйте принятие настоящего момента"
      ]
    },
    {
      id: "3",
      title: "Медитация для сна",
      description: "Расслабляющая практика для глубокого и качественного сна",
      duration: 15,
      category: "beginner",
      type: "sleep",
      icon: Moon,
      color: "from-indigo-500 to-purple-500",
      isPlaying: false,
      progress: 0,
      instructions: [
        "Лягте в удобной позе для сна",
        "Закройте глаза и расслабьте все мышцы",
        "Представьте, как напряжение покидает ваше тело",
        "Сосредоточьтесь на медленном, глубоком дыхании",
        "Визуализируйте спокойное место",
        "Позвольте себе погрузиться в сон"
      ]
    },
    {
      id: "4",
      title: "Концентрация внимания",
      description: "Упражнения для улучшения фокуса и умственной ясности",
      duration: 20,
      category: "intermediate",
      type: "focus",
      icon: Brain,
      color: "from-green-500 to-emerald-500",
      isPlaying: false,
      progress: 0,
      instructions: [
        "Сядьте прямо, закройте глаза",
        "Выберите объект концентрации (дыхание, звук, образ)",
        "Сосредоточьте все внимание на выбранном объекте",
        "При появлении отвлекающих мыслей, мягко возвращайтесь к объекту",
        "Увеличивайте время концентрации постепенно",
        "Развивайте устойчивость внимания"
      ]
    },
    {
      id: "5",
      title: "Прогрессивная релаксация",
      description: "Постепенное расслабление всех мышц тела для глубокого отдыха",
      duration: 25,
      category: "intermediate",
      type: "relaxation",
      icon: Heart,
      color: "from-orange-500 to-amber-500",
      isPlaying: false,
      progress: 0,
      instructions: [
        "Лягте на спину, руки вдоль тела",
        "Начните с пальцев ног - напрягите на 5 секунд, затем расслабьте",
        "Переходите к икрам, бедрам, животу, груди",
        "Продолжайте с руками, плечами, шеей, лицевыми мышцами",
        "Ощутите полное расслабление всего тела",
        "Оставайтесь в состоянии покоя"
      ]
    },
    {
      id: "6",
      title: "Медитация любящей доброты",
      description: "Практика сострадания и доброжелательности к себе и другим",
      duration: 30,
      category: "advanced",
      type: "mindfulness",
      icon: Heart,
      color: "from-red-500 to-pink-500",
      isPlaying: false,
      progress: 0,
      instructions: [
        "Сядьте удобно, закройте глаза",
        "Начните с пожелания счастья себе: 'Пусть я буду счастлив'",
        "Затем пожелайте счастья близким людям",
        "Расширьте пожелания на знакомых и незнакомых",
        "Включите в круг доброты даже тех, с кем у вас конфликт",
        "Почувствуйте, как любовь и сострадание наполняют ваше сердце"
      ]
    }
  ];

  const startSession = (session: MeditationSession) => {
    setCurrentSession(session);
    setTotalTime(session.duration * 60);
    setCurrentTime(0);
    setIsPlaying(true);
    setShowInstructions(true);
    setCurrentInstruction(0);
    
    // Звуковой сигнал начала медитации
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.log('Аудио не поддерживается в этом браузере');
      }
    }
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
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  // Таймер для медитации
  useEffect(() => {
    if (isPlaying && currentTime < totalTime) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalTime) {
            setIsPlaying(false);
            
            // Звуковой сигнал завершения медитации
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
                  
                  noteGain.gain.setValueAtTime(0.1, audioContext.currentTime + index * 0.2);
                  noteGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.2 + 0.3);
                  
                  noteOsc.start(audioContext.currentTime + index * 0.2);
                  noteOsc.stop(audioContext.currentTime + index * 0.2 + 0.3);
                });
              } catch (error) {
                console.log('Аудио не поддерживается в этом браузере');
              }
            }
            
            // Уведомление о завершении медитации
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

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Заголовок */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full mb-4">
          <Sparkles className="w-6 h-6" />
          <span className="text-lg font-semibold">Медитации</span>
        </div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          Путь к внутреннему спокойствию
        </h1>
        <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
          Откройте для себя древние практики медитации, которые помогут обрести гармонию, 
          снять стресс и развить осознанность в современном мире
        </p>
      </div>

      {/* Текущая сессия */}
      {currentSession && (
        <div className="relative bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
          {/* Анимированный фон для активной медитации */}
          {isPlaying && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-2xl opacity-50" />
          )}
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${currentSession.color} rounded-full flex items-center justify-center relative`}>
                  <currentSession.icon className="w-8 h-8 text-white" />
                                      {isPlaying && (
                      <div className="absolute inset-0 border-2 border-white rounded-full scale-110 opacity-70" />
                    )}
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-2xl text-gray-800">{currentSession.title}</CardTitle>
                                          {isPlaying && (
                        <div className="flex items-center space-x-1 text-green-600 opacity-75">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">В процессе</span>
                        </div>
                      )}
                  </div>
                  <CardDescription className="text-gray-600">{currentSession.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
                         <CardContent className="space-y-6">
               {/* Инструкции */}
               {showInstructions && currentSession && (
                 <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
                   <div className="flex items-center justify-between mb-3">
                     <h4 className="font-semibold text-gray-800">Инструкция {currentInstruction + 1} из {currentSession.instructions.length}</h4>
                     <div className="flex space-x-2">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={previousInstruction}
                         disabled={currentInstruction === 0}
                         className="w-8 h-8 p-0"
                       >
                         ←
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={nextInstruction}
                         disabled={currentInstruction === currentSession.instructions.length - 1}
                         className="w-8 h-8 p-0"
                       >
                         →
                       </Button>
                     </div>
                   </div>
                   <p className="text-gray-700 text-center text-lg leading-relaxed">
                     {currentSession.instructions[currentInstruction]}
                   </p>
                   
                   {/* Прогресс инструкций */}
                   <div className="flex justify-center mt-3">
                     {currentSession.instructions.map((_, index) => (
                       <div
                         key={index}
                         className={`w-2 h-2 rounded-full mx-1 ${
                           index === currentInstruction ? 'bg-purple-500' : 'bg-gray-300'
                         }`}
                       />
                     ))}
                   </div>
                 </div>
               )}

               {/* Прогресс */}
               <div className="space-y-3">
                 <div className="flex justify-between text-sm text-gray-600">
                   <span>Прогресс</span>
                   <span>{formatTime(currentTime)} / {formatTime(totalTime)}</span>
                 </div>
                 <Progress value={(currentTime / totalTime) * 100} className="h-3" />
               </div>

               {/* Управление */}
               <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={stopSession}
                  className="px-6"
                >
                  <SkipBack className="w-5 h-5 mr-2" />
                  Остановить
                </Button>
                
                {isPlaying ? (
                  <Button
                    size="lg"
                    onClick={pauseSession}
                    className={`bg-gradient-to-r ${currentSession.color} text-white px-8`}
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    Пауза
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={resumeSession}
                    className={`bg-gradient-to-r ${currentSession.color} text-white px-8`}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Продолжить
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Список медитаций */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Выберите медитацию</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meditationSessions.map((session, index) => (
            <div
              key={session.id}
              className="transform transition-all duration-300 hover:scale-105"
            >
              <Card className="h-full border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 cursor-pointer overflow-hidden group">
                <div className={`h-2 bg-gradient-to-r ${session.color}`} />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 bg-gradient-to-r ${session.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <session.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge className={getCategoryColor(session.category)}>
                      {getCategoryText(session.category)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                    {session.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">
                    {session.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Timer className="w-4 h-4" />
                      <span>{session.duration} мин</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {getTypeIcon(session.type)}
                    </div>
                  </div>
                  
                                     <div className="space-y-2">
                     <Button
                       onClick={() => startSession(session)}
                       className={`w-full bg-gradient-to-r ${session.color} hover:opacity-90 text-white transition-all duration-300 group-hover:scale-105`}
                     >
                       <Play className="w-4 h-4 mr-2" />
                       Начать
                     </Button>
                     
                     <Button
                       variant="outline"
                       onClick={() => {
                         setCurrentSession(session);
                         setShowInstructions(true);
                         setCurrentInstruction(0);
                       }}
                       className="w-full text-sm"
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

      {/* Преимущества медитации */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Преимущества регулярной практики медитации
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Brain,
              title: "Улучшение концентрации",
              description: "Развитие внимания и умственной ясности"
            },
            {
              icon: Heart,
              title: "Снижение стресса",
              description: "Уменьшение тревожности и напряжения"
            },
            {
              icon: Moon,
              title: "Качественный сон",
              description: "Глубокий отдых и восстановление"
            },
            {
              icon: Sparkles,
              title: "Эмоциональный баланс",
              description: "Стабильность настроения и спокойствие"
            }
          ].map((benefit, index) => (
            <div
              key={index}
              className="text-center transform transition-all duration-300 hover:scale-105"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Советы для начинающих */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          💡 Советы для начинающих
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Начните с малого</h4>
                <p className="text-sm text-gray-600">Начните с 5-10 минут в день и постепенно увеличивайте время</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Выберите удобное время</h4>
                <p className="text-sm text-gray-600">Медитируйте в одно и то же время каждый день</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Найдите тихое место</h4>
                <p className="text-sm text-gray-600">Убедитесь, что вас никто не потревожит</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Будьте терпеливы</h4>
                <p className="text-sm text-gray-600">Результаты приходят с практикой, не ожидайте мгновенных изменений</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Настройки уведомлений */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🔔 Уведомления о завершении
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Получайте уведомления о завершении медитации, чтобы не пропустить момент 
            и плавно вернуться к повседневным делам
          </p>
          
          {Notification.permission === 'default' && (
            <Button
              onClick={() => Notification.requestPermission()}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3"
            >
              <Bell className="w-4 h-4 mr-2" />
              Разрешить уведомления
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
