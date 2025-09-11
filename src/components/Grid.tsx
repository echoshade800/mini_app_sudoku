import React from 'react';
import type { Board } from '../types/game';

interface GridProps {
  board: Board;
  selectedCell: number | null;
  onCellSelect: (index: number) => void;
  highlightedNumbers?: Set<number>;
}

export const Grid: React.FC<GridProps> = ({ 
  board, 
  selectedCell, 
  onCellSelect,
  highlightedNumbers = new Set()
}) => {
  const getHighlightClass = (index: number, cellValue: number): string => {
    const cell = board[index];
    const isSelected = index === selectedCell;
    const isHighlighted = selectedCell !== null && (
      // Same row
      Math.floor(index / 9) === Math.floor(selectedCell / 9) ||
      // Same column  
      index % 9 === selectedCell % 9 ||
      // Same 3x3 box
      Math.floor(index / 27) === Math.floor(selectedCell / 27) && 
      Math.floor((index % 9) / 3) === Math.floor((selectedCell % 9) / 3)
    );
    const isSameNumber = cellValue !== 0 && selectedCell !== null && 
                        board[selectedCell].value === cellValue;
    const hasConflict = cell.isConflict;

    if (hasConflict) return 'bg-red-200 border-red-400';
    if (isSelected) return 'bg-blue-300 border-blue-500';
    if (isSameNumber) return 'bg-blue-100 border-blue-300';
    if (isHighlighted) return 'bg-blue-50 border-blue-200';
    return 'bg-white border-gray-300 hover:bg-gray-50';
  };

  const getBorderClass = (index: number): string => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    
    let classes = 'border';
    
    // Thick borders for 3x3 boxes
    if (row % 3 === 0) classes += ' border-t-2 border-t-gray-800';
    if (row === 8) classes += ' border-b-2 border-b-gray-800';
    if (col % 3 === 0) classes += ' border-l-2 border-l-gray-800';
    if (col === 8) classes += ' border-r-2 border-r-gray-800';
    
    return classes;
  };

  const renderCellContent = (cell: any, index: number) => {
    if (cell.value !== 0) {
      return (
        <span className={`text-lg font-semibold ${cell.fixed ? 'text-gray-900' : 'text-blue-600'}`}>
          {cell.value}
        </span>
      );
    }

    if (cell.notes.size > 0) {
      return (
        <div className="grid grid-cols-3 gap-0.5 p-0.5 text-xs text-gray-500">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i + 1} className="flex items-center justify-center h-2">
              {cell.notes.has(i + 1) ? (i + 1) : ''}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="grid grid-cols-9 gap-0 bg-gray-800 p-1.5 rounded-lg shadow-lg max-w-sm mx-auto aspect-square touch-manipulation">
      {board.map((cell, index) => (
        <button
          key={index}
          className={`
            ${getHighlightClass(index, cell.value)}
            ${getBorderClass(index)}
            flex items-center justify-center
            h-9 w-9 sm:h-10 sm:w-10
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:z-10
            active:scale-95
            ${cell.isConflict ? 'animate-pulse' : ''}
            touch-manipulation
          `}
          onClick={() => onCellSelect(index)}
        >
          {renderCellContent(cell, index)}
        </button>
      ))}
    </div>
  );
};