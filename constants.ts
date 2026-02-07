
import { TimerMode } from './types';

export const TIMER_CONFIG = {
  [TimerMode.WORK]: 25 * 60,
  [TimerMode.SHORT_BREAK]: 5 * 60,
  [TimerMode.LONG_BREAK]: 15 * 60,
};

export const MODE_LABELS = {
  [TimerMode.WORK]: '集中タイム',
  [TimerMode.SHORT_BREAK]: '短い休憩',
  [TimerMode.LONG_BREAK]: '長い休憩',
};

export const THEME_COLORS = {
  [TimerMode.WORK]: 'bg-rose-500',
  [TimerMode.SHORT_BREAK]: 'bg-teal-500',
  [TimerMode.LONG_BREAK]: 'bg-indigo-500',
};

export const GRADIENT_COLORS = {
  [TimerMode.WORK]: 'from-rose-50 to-rose-100',
  [TimerMode.SHORT_BREAK]: 'from-teal-50 to-teal-100',
  [TimerMode.LONG_BREAK]: 'from-indigo-50 to-indigo-100',
};
