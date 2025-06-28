'use client';

import { PriorityWeight } from '@/types';

interface PrioritySliderProps {
  priority: PriorityWeight;
  onChange: (value: number) => void;
}

export default function PrioritySlider({ priority, onChange }: PrioritySliderProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">{priority.description}</label>
        <span className="text-sm font-medium text-gray-900">{priority.weight}</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={priority.weight}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
}