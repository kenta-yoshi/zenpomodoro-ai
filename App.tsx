
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode, Task, AIInsight } from './types';
import { TIMER_CONFIG, MODE_LABELS, GRADIENT_COLORS } from './constants';
import TimerDisplay from './components/TimerDisplay';
import TaskList from './components/TaskList';
import AIWidget from './components/AIWidget';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>(TimerMode.WORK);
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIG[TimerMode.WORK]);
  const [isActive, setIsActive] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Fix: Use number for timer reference in browser environment to avoid NodeJS namespace dependency
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio for notifications
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  // Timer Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = useCallback(() => {
    setIsActive(false);
    audioRef.current?.play();
    
    // Update active task pomodoro count if it was a WORK session
    if (mode === TimerMode.WORK && activeTaskId) {
      setTasks(prev => prev.map(t => 
        t.id === activeTaskId ? { ...t, pomodoros: t.pomodoros + 1 } : t
      ));
    }

    // Auto switch mode logic (simple)
    if (mode === TimerMode.WORK) {
      setMode(TimerMode.SHORT_BREAK);
      setTimeLeft(TIMER_CONFIG[TimerMode.SHORT_BREAK]);
    } else {
      setMode(TimerMode.WORK);
      setTimeLeft(TIMER_CONFIG[TimerMode.WORK]);
    }
    
    // Refresh AI Insight
    refreshAIInsight();
  }, [mode, activeTaskId]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(TIMER_CONFIG[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_CONFIG[newMode]);
    setIsActive(false);
    refreshAIInsight(newMode);
  };

  const refreshAIInsight = async (targetMode: TimerMode = mode) => {
    const activeTask = tasks.find(t => t.id === activeTaskId);
    setIsAiLoading(true);
    const insight = await geminiService.getFocusInsight(activeTask?.title || '作業一般', targetMode);
    setAiInsight(insight);
    setIsAiLoading(false);
  };

  // Task Handlers
  const addTask = (title: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      pomodoros: 0,
      estimatedPomodoros: 1
    };
    setTasks([...tasks, newTask]);
    if (!activeTaskId) setActiveTaskId(newTask.id);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const selectTask = (id: string) => {
    setActiveTaskId(id);
    refreshAIInsight();
  };

  const activeTask = tasks.find(t => t.id === activeTaskId);

  return (
    <div className={`min-h-screen transition-colors duration-700 flex flex-col items-center bg-gradient-to-b ${GRADIENT_COLORS[mode]} p-4 md:p-12`}>
      <header className="w-full max-w-6xl flex justify-between items-center mb-12">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-rose-500 rounded-2xl shadow-lg shadow-rose-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">ZenPomodoro <span className="text-rose-500">AI</span></h1>
        </div>
        <div className="flex space-x-4">
           {Object.entries(TimerMode).map(([key, value]) => (
             <button
                key={value}
                onClick={() => switchMode(value as TimerMode)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  mode === value 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
             >
               {MODE_LABELS[value as TimerMode]}
             </button>
           ))}
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Tasks */}
        <div className="lg:col-span-4 order-3 lg:order-1 flex flex-col space-y-6">
          <TaskList 
            tasks={tasks}
            activeTaskId={activeTaskId}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onSelectTask={selectTask}
          />
          <AIWidget insight={aiInsight} isLoading={isAiLoading} mode={mode} />
        </div>

        {/* Middle Column: Timer */}
        <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col items-center space-y-8">
          <div className="bg-white/40 backdrop-blur-md p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white/60 flex flex-col items-center w-full">
            <div className="mb-4 text-center">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-md ${
                mode === TimerMode.WORK ? 'bg-rose-500' : mode === TimerMode.SHORT_BREAK ? 'bg-teal-500' : 'bg-indigo-500'
              }`}>
                {MODE_LABELS[mode]}
              </span>
              <h2 className="mt-4 text-2xl font-bold text-slate-800">
                {activeTask ? activeTask.title : 'タスクを選択してください'}
              </h2>
            </div>
            
            <TimerDisplay timeLeft={timeLeft} mode={mode} isActive={isActive} />

            <div className="flex items-center space-x-6 mt-8">
              <button
                onClick={resetTimer}
                className="p-4 bg-slate-100 text-slate-500 rounded-3xl hover:bg-slate-200 transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={toggleTimer}
                className={`p-8 rounded-[2.5rem] shadow-xl transition-all active:scale-95 ${
                  isActive ? 'bg-slate-800 text-white shadow-slate-300' : 'bg-rose-500 text-white shadow-rose-200'
                }`}
              >
                {isActive ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleTimerComplete}
                className="p-4 bg-slate-100 text-slate-500 rounded-3xl hover:bg-slate-200 transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Analytics/Motivation */}
        <div className="lg:col-span-3 order-2 lg:order-3 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">今日の実績</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-rose-50 p-4 rounded-2xl">
                <span className="block text-2xl font-bold text-rose-500">
                  {tasks.reduce((acc, curr) => acc + curr.pomodoros, 0)}
                </span>
                <span className="text-[10px] font-medium text-rose-400 uppercase">Poms</span>
              </div>
              <div className="bg-teal-50 p-4 rounded-2xl">
                <span className="block text-2xl font-bold text-teal-500">
                  {tasks.filter(t => t.completed).length}
                </span>
                <span className="text-[10px] font-medium text-teal-400 uppercase">Done</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-3xl shadow-xl shadow-slate-200">
            <p className="text-white text-sm font-medium italic opacity-80 leading-relaxed">
              「集中は、知性の光を一箇所に集めることである。」
            </p>
            <div className="mt-4 flex items-center space-x-2 text-rose-400">
               <div className="w-1 h-1 bg-rose-400 rounded-full animate-ping"></div>
               <span className="text-[10px] font-black uppercase">Deep Focus Activated</span>
            </div>
          </div>
        </div>
      </main>

      {/* Persistent CTA / Status */}
      <footer className="fixed bottom-6 w-full max-w-sm px-4 md:hidden">
        <button 
          onClick={toggleTimer}
          className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl transform transition-transform active:scale-95 ${
            isActive ? 'bg-slate-900' : 'bg-rose-500'
          }`}
        >
          {isActive ? 'PAUSE TIMER' : 'START TIMER'}
        </button>
      </footer>
    </div>
  );
};

export default App;
