
import React from 'react';
import { AIInsight, TimerMode } from '../types';

interface AIWidgetProps {
  insight: AIInsight | null;
  isLoading: boolean;
  mode: TimerMode;
}

const AIWidget: React.FC<AIWidgetProps> = ({ insight, isLoading, mode }) => {
  if (isLoading) {
    return (
      <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-slate-100 rounded w-full"></div>
          <div className="h-3 bg-slate-100 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!insight) return null;

  const isWork = mode === TimerMode.WORK;

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
      <div className={`absolute top-0 right-0 p-3 opacity-10 ${isWork ? 'text-rose-500' : 'text-teal-500'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">AI Focus Coaching</h3>
      
      {isWork ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-500 leading-relaxed italic mb-2">"{insight.motivation}"</p>
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter block mb-1">Focus Strategy</span>
              <p className="text-sm font-medium text-slate-700">{insight.tip}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
           <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-tighter block mb-1">Recovery Tip</span>
            <p className="text-sm font-medium text-slate-700">{insight.suggestedBreakActivity}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIWidget;
