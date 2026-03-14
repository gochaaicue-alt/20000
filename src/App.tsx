import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Timer, 
  Users, 
  Phone, 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  ChevronRight,
  Info,
  Volume2,
  VolumeX
} from 'lucide-react';
import { PRIZES, Question, QUESTIONS as STATIC_QUESTIONS } from './questions';
import { generateQuestions } from './services/geminiService';

type GameStatus = 'idle' | 'start' | 'playing' | 'checking' | 'won' | 'lost' | 'finished' | 'loading';

const SOUNDS = {
  START: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  SELECT: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  CORRECT: '/clap.mp3', // Local applause file
  WRONG: '/errorvoice.mp3',
  WIN: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  LOST: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3',
  MENU: '/start.mp3'
};

const START_IMAGE = "https://upload.wikimedia.org/wikipedia/ka/thumb/8/8c/Who_Wants_to_Be_a_Millionaire_Georgia.png/250px-Who_Wants_to_Be_a_Millionaire_Georgia.png"; // Fallback if needed, but I'll use a descriptive placeholder or the actual one if I can.

// Using the provided image as a base64 or similar if possible, but for now I will use a high quality placeholder that represents the show or the one I see.
// Since I can't "upload" a file to the server directly from here, I'll use a placeholder that fits the theme or ask the user to provide a URL.
// Actually, I can use a placeholder and suggest how to replace it, OR I can try to find a similar one.
// Wait, the user uploaded an image. I should use it. I'll use a placeholder for now and the user can see it.

export default function App() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [questions, setQuestions] = useState<Question[]>(STATIC_QUESTIONS);
  const [isPreparing, setIsPreparing] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [score, setScore] = useState("0");
  const [isMuted, setIsMuted] = useState(false);
  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    phone: true,
    audience: true
  });
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const menuAudioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback((url: string) => {
    if (isMuted) return;
    const audio = new Audio(url);
    audio.play().catch(e => console.warn("Audio playback blocked by browser:", e));
  }, [isMuted]);

  const prepareQuestions = async () => {
    setIsPreparing(true);
    try {
      console.log("Preparing questions via AI...");
      const newQuestions = await generateQuestions();
      if (newQuestions && newQuestions.length === 15) {
        setQuestions(newQuestions);
        console.log("AI questions prepared successfully.");
      } else {
        throw new Error("Invalid questions format received");
      }
    } catch (error) {
      console.error("AI question preparation failed, using static questions:", error);
      setQuestions(STATIC_QUESTIONS);
    } finally {
      setIsPreparing(false);
    }
  };

  useEffect(() => {
    // No longer auto-preparing on mount
  }, []);

  useEffect(() => {
    if (status === 'start' && !isMuted) {
      if (!menuAudioRef.current) {
        menuAudioRef.current = new Audio(SOUNDS.MENU);
        menuAudioRef.current.loop = false;
      }
      menuAudioRef.current.currentTime = 0;
      menuAudioRef.current.play().catch(e => console.warn("Menu audio blocked:", e));
    } else if (status !== 'start') {
      if (menuAudioRef.current) {
        menuAudioRef.current.pause();
        menuAudioRef.current.currentTime = 0;
      }
    }
    
    return () => {
      if (menuAudioRef.current) {
        menuAudioRef.current.pause();
      }
    };
  }, [status, isMuted]);

  const handleInitialClick = () => {
    setStatus('start');
    prepareQuestions();
  };

  const currentQuestion = questions[currentLevel];

  const startGame = () => {
    playSound(SOUNDS.START);
    setCurrentLevel(0);
    setStatus('playing');
    setSelectedAnswer(null);
    setShowCorrect(false);
    setScore("0");
    setLifelines({ fiftyFifty: true, phone: true, audience: true });
    setHiddenOptions([]);
    setHint(null);
  };

  const resetGame = () => {
    setStatus('start');
    prepareQuestions();
  };

  const handleAnswer = (index: number) => {
    if (status !== 'playing') return;
    playSound(SOUNDS.SELECT);
    setSelectedAnswer(index);
    setStatus('checking');
    setHint(null);
    
    // Wait for dramatic effect
    setTimeout(() => {
      const isCorrect = index === currentQuestion.correctAnswer;
      
      if (isCorrect) {
        playSound(SOUNDS.CORRECT);
      } else {
        playSound(SOUNDS.WRONG);
      }
      
      setShowCorrect(true);
      
      setTimeout(() => {
        if (isCorrect) {
          if (currentLevel === questions.length - 1) {
            playSound(SOUNDS.WIN);
            setScore(PRIZES[currentLevel]);
            setStatus('won');
          } else {
            setScore(PRIZES[currentLevel]);
            // Move to next level after a short delay
            setTimeout(() => {
              setCurrentLevel(prev => prev + 1);
              setStatus('playing');
              setSelectedAnswer(null);
              setShowCorrect(false);
              setHiddenOptions([]);
            }, 1500);
          }
        } else {
          playSound(SOUNDS.LOST);
          setStatus('lost');
        }
      }, 1000);
    }, 1500);
  };

  const useFiftyFifty = () => {
    if (!lifelines.fiftyFifty || status !== 'playing') return;
    
    const correct = currentQuestion.correctAnswer;
    const others = [0, 1, 2, 3].filter(i => i !== correct);
    const toHide = others.sort(() => Math.random() - 0.5).slice(0, 2);
    
    setHiddenOptions(toHide);
    setLifelines(prev => ({ ...prev, fiftyFifty: false }));
  };

  const usePhone = () => {
    if (!lifelines.phone || status !== 'playing') return;
    const correct = currentQuestion.correctAnswer;
    const options = ['A', 'B', 'C', 'D'];
    // 80% chance to give correct answer
    const isCorrect = Math.random() < 0.8;
    const suggested = isCorrect ? options[correct] : options[Math.floor(Math.random() * 4)];
    
    setHint(`მეგობარი ფიქრობს, რომ სწორი პასუხია: ${suggested}`);
    setLifelines(prev => ({ ...prev, phone: false }));
  };

  const useAudience = () => {
    if (!lifelines.audience || status !== 'playing') return;
    const correct = currentQuestion.correctAnswer;
    const options = ['A', 'B', 'C', 'D'];
    
    setHint(`დარბაზის უმრავლესობა (65%) ხმას აძლევს ვარიანტს: ${options[correct]}`);
    setLifelines(prev => ({ ...prev, audience: false }));
  };

  const getStatusColor = (index: number) => {
    if (!showCorrect) {
      return selectedAnswer === index ? 'selected' : '';
    }
    if (index === currentQuestion.correctAnswer) return 'correct';
    if (selectedAnswer === index) return 'wrong';
    return '';
  };

  return (
    <div className="min-h-screen bg-game-bg text-white font-sans selection:bg-game-accent selection:text-black">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 h-screen flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-game-accent rounded-full flex items-center justify-center pulse-gold">
              <Trophy className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight">ვის უნდა ოცი ათასი</h1>
              <p className="text-xs text-white/50 uppercase tracking-widest">ინტელექტუალური თამაში</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10"
              title={isMuted ? "ხმის ჩართვა" : "ხმის გამორთვა"}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-game-accent" />}
            </button>
            <div className="glass-panel px-6 py-2 rounded-full flex items-center gap-3 border-game-accent/30">
              <span className="text-game-accent font-display font-bold text-xl">₾ {score}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-hidden">
          {/* Left: Lifelines & Info */}
          <div className="hidden lg:flex flex-col gap-6">
            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">დახმარებები</h3>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={useFiftyFifty}
                  disabled={!lifelines.fiftyFifty || status !== 'playing'}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                    lifelines.fiftyFifty && status === 'playing' 
                      ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-game-accent/50 cursor-pointer' 
                      : 'opacity-30 cursor-not-allowed bg-black/20 border border-transparent'
                  }`}
                >
                  <span className="text-sm font-medium">50:50</span>
                  <Zap className={`w-5 h-5 ${lifelines.fiftyFifty ? 'text-game-accent' : 'text-white/20'}`} />
                </button>
                <button 
                  onClick={usePhone}
                  disabled={!lifelines.phone || status !== 'playing'}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                    lifelines.phone && status === 'playing' 
                      ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-game-accent/50 cursor-pointer' 
                      : 'opacity-30 cursor-not-allowed bg-black/20 border border-transparent'
                  }`}
                >
                  <span className="text-sm font-medium">დარეკვა</span>
                  <Phone className={`w-5 h-5 ${lifelines.phone ? 'text-game-accent' : 'text-white/20'}`} />
                </button>
                <button 
                  onClick={useAudience}
                  disabled={!lifelines.audience || status !== 'playing'}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                    lifelines.audience && status === 'playing' 
                      ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-game-accent/50 cursor-pointer' 
                      : 'opacity-30 cursor-not-allowed bg-black/20 border border-transparent'
                  }`}
                >
                  <span className="text-sm font-medium">დარბაზი</span>
                  <Users className={`w-5 h-5 ${lifelines.audience ? 'text-game-accent' : 'text-white/20'}`} />
                </button>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-game-accent" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">ინფორმაცია</h3>
              </div>
              {hint ? (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-game-accent/10 border border-game-accent/30 p-4 rounded-xl text-sm text-game-accent font-medium"
                >
                  {hint}
                </motion.div>
              ) : (
                <p className="text-sm text-white/60 leading-relaxed">
                  პასუხის გასაცემად აირჩიეთ ერთ-ერთი ვარიანტი. ყოველი სწორი პასუხი გადაგიყვანთ შემდეგ ეტაპზე.
                </p>
              )}
            </div>
          </div>

          {/* Center: Question Area */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <AnimatePresence mode="wait">
              {status === 'idle' ? (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
                >
                  <button
                    onClick={handleInitialClick}
                    className="group relative px-12 py-6 bg-transparent border-2 border-game-accent rounded-full overflow-hidden transition-all hover:bg-game-accent"
                  >
                    <span className="relative z-10 text-2xl font-display font-bold text-game-accent group-hover:text-black transition-colors">
                      დავიწყოთ თამაში?
                    </span>
                    <div className="absolute inset-0 bg-game-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </motion.div>
              ) : status === 'loading' && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="w-16 h-16 border-4 border-game-accent border-t-transparent rounded-full animate-spin mb-6" />
                  <h2 className="text-2xl font-display font-bold mb-2">კითხვები მზადდება...</h2>
                  <p className="text-white/60">გთხოვთ დაელოდოთ, AI გენერირებს ახალ კითხვებს</p>
                </motion.div>
              )}

              {status === 'start' ? (
                <motion.div 
                  key="start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-game-accent/20 blur-3xl rounded-full" />
                    <img 
                      src="/images.jpg" 
                      alt="Host"
                      className="w-64 h-64 object-cover rounded-full border-4 border-game-accent relative z-10 shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-game-accent rounded-full flex items-center justify-center z-20 pulse-gold">
                      <Trophy className="text-black w-8 h-8" />
                    </div>
                  </div>
                  <h2 className="text-5xl font-display font-bold mb-4">მზად ხართ?</h2>
                  <p className="text-xl text-white/60 mb-12 max-w-md">
                    გამოსცადეთ თქვენი ცოდნა და მოიგეთ ვირტუალური პრიზი.
                  </p>
                  {isPreparing ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-game-accent border-t-transparent rounded-full animate-spin" />
                      <p className="text-game-accent font-medium animate-pulse">კითხვები მზადდება...</p>
                    </div>
                  ) : (
                    <button 
                      onClick={startGame}
                      className="bg-game-accent text-black px-12 py-4 rounded-full font-bold text-xl hover:scale-105 transition-transform active:scale-95 flex items-center gap-3"
                    >
                      თამაშის დაწყება
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}
                </motion.div>
              ) : status === 'won' || status === 'lost' ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-8"
                >
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${status === 'won' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {status === 'won' ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                  </div>
                  <h2 className="text-4xl font-display font-bold mb-2">
                    {status === 'won' ? 'გილოცავთ!' : 'თამაში დასრულდა'}
                  </h2>
                  <p className="text-6xl font-display font-bold text-game-accent mb-8">₾ {score}</p>
                  <button 
                    onClick={resetGame}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-8 py-3 rounded-full font-medium transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                    თავიდან დაწყება
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="game"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col gap-8"
                >
                  {/* Question Box */}
                  <div className="flex-1 glass-panel rounded-[40px] p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                      <motion.div 
                        className="h-full bg-game-accent"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((currentLevel + 1) / questions.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-game-accent font-bold text-sm uppercase tracking-widest mb-6 block">
                      კითხვა {currentLevel + 1} / {questions.length}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight max-w-2xl">
                      {currentQuestion.text}
                    </h2>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        disabled={status !== 'playing' || hiddenOptions.includes(index)}
                        onClick={() => handleAnswer(index)}
                        className={`option-btn p-6 text-left font-medium text-lg flex items-center gap-4 ${getStatusColor(index)} ${hiddenOptions.includes(index) ? 'opacity-0 pointer-events-none' : ''}`}
                      >
                        <span className="text-game-accent font-bold w-6">{['A', 'B', 'C', 'D'][index]}:</span>
                        {option}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Money Tree */}
          <div className="hidden lg:flex flex-col glass-panel rounded-3xl overflow-hidden">
            <div className="p-6 border-bottom border-white/5 bg-white/5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">პრიზების სია</h3>
            </div>
            <div className="flex-1 flex flex-col-reverse p-4 gap-1 overflow-y-auto">
              {PRIZES.map((prize, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                    currentLevel === index 
                      ? 'bg-game-accent text-black font-bold scale-105 shadow-lg' 
                      : currentLevel > index 
                        ? 'text-game-accent/50' 
                        : 'text-white/40'
                  }`}
                >
                  <span className="text-xs w-6">{index + 1}</span>
                  <span className="font-display font-medium">₾ {prize}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
