
import React, { useState } from 'react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: (title: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSelectTask: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  activeTaskId, 
  onAddTask, 
  onToggleTask, 
  onDeleteTask,
  onSelectTask
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle);
      setNewTaskTitle('');
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">タスク一覧</h2>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
          {tasks.length} タスク
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative group">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="新しいタスクを入力..."
            className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all outline-none"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 p-1 px-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors shadow-sm"
          >
            追加
          </button>
        </div>
      </form>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
        {tasks.map((task) => (
          <div 
            key={task.id}
            onClick={() => onSelectTask(task.id)}
            className={`group relative flex items-center p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTaskId === task.id 
                ? 'bg-rose-50 border-rose-200 ring-2 ring-rose-50' 
                : 'bg-white border-slate-100 hover:border-rose-200'
            }`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) => {
                e.stopPropagation();
                onToggleTask(task.id);
              }}
              className="w-5 h-5 rounded-full border-2 border-slate-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
            />
            <div className="ml-4 flex-1">
              <p className={`text-sm font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {task.title}
              </p>
              <div className="flex items-center mt-1 space-x-2">
                 <span className="text-[10px] text-slate-400 font-medium">
                  {task.pomodoros} / {task.estimatedPomodoros} Poms
                 </span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTask(task.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">タスクはありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
