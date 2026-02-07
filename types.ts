
export enum TimerMode {
  WORK = 'WORK',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK'
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  pomodoros: number;
  estimatedPomodoros: number;
}

export interface PomodoroStats {
  totalFocusTime: number;
  completedSessions: number;
  dailyGoal: number;
}

export interface AIInsight {
  tip: string;
  motivation: string;
  suggestedBreakActivity: string;
}
