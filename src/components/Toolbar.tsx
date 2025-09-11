import React from 'react';
import { Undo2, Eraser, Edit3, Lightbulb, Redo2 } from 'lucide-react';

interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  isNotesMode: boolean;
  hintsRemaining: number;
  onUndo: () => void;
  onRedo: () => void;
  onErase: () => void;
  onToggleNotes: () => void;
  onHint: () => void;
  disabled?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  canUndo,
  canRedo,
  isNotesMode,
  hintsRemaining,
  onUndo,
  onRedo,
  onErase,
  onToggleNotes,
  onHint,
  disabled = false
}) => {
  const buttonClass = (isActive = false, isDisabled = false) => `
    flex flex-col items-center justify-center gap-1 p-2 rounded-lg
    transition-all duration-150
    touch-manipulation
    ${isDisabled 
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
      : isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-white text-gray-700 active:bg-gray-50 border border-gray-200 shadow-sm'
    }
    focus:outline-none focus:ring-2 focus:ring-blue-400
    active:scale-95
    min-h-[56px]
  `;

  return (
    <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-gray-50 rounded-lg">
      <button
        className={buttonClass(false, !canUndo || disabled)}
        onClick={onUndo}
        disabled={!canUndo || disabled}
      >
        <Undo2 size={18} />
        <span className="text-xs font-medium">Undo</span>
      </button>

      <button
        className={buttonClass(false, disabled)}
        onClick={onErase}
        disabled={disabled}
      >
        <Eraser size={18} />
        <span className="text-xs font-medium">Erase</span>
      </button>

      <button
        className={buttonClass(isNotesMode, disabled)}
        onClick={onToggleNotes}
        disabled={disabled}
      >
        <Edit3 size={18} />
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium">Notes</span>
          {!isNotesMode}
        </div>
      </button>

      <button
        className={buttonClass(false, hintsRemaining === 0 || disabled)}
        onClick={onHint}
        disabled={hintsRemaining === 0 || disabled}
      >
        <Lightbulb size={18} />
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium">Hint</span>
          {hintsRemaining > 0 && (
            <span className="text-xs bg-blue-600 text-white px-1 rounded min-w-[14px] text-center text-[10px]">
              {hintsRemaining}
            </span>
          )}
        </div>
      </button>

      <button
        className={buttonClass(false, !canRedo || disabled)}
        onClick={onRedo}
        disabled={!canRedo || disabled}
      >
        <Redo2 size={18} />
        <span className="text-xs font-medium">Redo</span>
      </button>
    </div>
  );
};