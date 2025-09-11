import React from 'react';
import type { CellValue } from '../types/game';

interface KeypadProps {
  onNumberSelect: (value: CellValue) => void;
  disabled?: boolean;
  selectedNumber?: CellValue;
}

export const Keypad: React.FC<KeypadProps> = ({ 
  onNumberSelect, 
  disabled = false,
  selectedNumber 
}) => {
  const numbers: CellValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="grid grid-cols-9 gap-1.5 px-3 py-2 bg-gray-50 rounded-lg">
      {numbers.map((num) => (
        <button
          key={num}
          className={`
            h-11 w-full rounded-lg font-semibold text-base
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-blue-400
            active:scale-95
            touch-manipulation
            ${disabled 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : selectedNumber === num
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-blue-600 active:bg-blue-50 border border-blue-200 shadow-sm'
            }
          `}
          onClick={() => onNumberSelect(num)}
          disabled={disabled}
        >
          {num}
        </button>
      ))}
    </div>
  );
};