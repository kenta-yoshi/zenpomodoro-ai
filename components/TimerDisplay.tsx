
import React from 'react';
import { TimerMode } from '../types';
import { TIMER_CONFIG } from '../constants';

interface TimerDisplayProps {
  timeLeft: number;
  mode: TimerMode;
  isActive: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, mode, isActive }) => {
  const totalSeconds = TIMER_CONFIG[mode];
  const progress = (timeLeft / totalSeconds) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Circle SVG properties
  // viewBoxを320x320とし、中心を160に設定。半径140+ストローク5で外周145。
  // 160-145=15pxの余白が全方向にあるため、絶対に切れません。
  const radius = 135; 
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const getStrokeColor = () => {
    switch (mode) {
      case TimerMode.WORK: return '#f43f5e'; // rose-500
      case TimerMode.SHORT_BREAK: return '#14b8a6'; // teal-500
      case TimerMode.LONG_BREAK: return '#6366f1'; // indigo-500
      default: return '#cbd5e1';
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* SVGコンテナ自体は回転させず、内部の描画位置で調整する方が安全 */}
      <svg 
        className="w-80 h-80 overflow-visible" 
        viewBox="0 0 320 320"
      >
        {/* Background Circle */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-100"
        />
        {/* Progress Circle (開始位置を上にするために、円の中心160,160を基準に-90度回転) */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          style={{ 
            strokeDashoffset: offset,
            transform: 'rotate(-90deg)',
            transformOrigin: '160px 160px'
          }}
          className="timer-circle transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-6xl font-black tracking-tighter text-slate-800">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <div className="flex items-center space-x-2 mt-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            {isActive ? 'Focusing' : 'Paused'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;
