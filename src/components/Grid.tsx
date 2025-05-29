// src/components/Grid.tsx
import React from 'react';
import Cell from './Cell';
import './Grid.css';

export type SudokuGridType = (number | null)[][];

interface GridProps {
  grid: SudokuGridType;
  initialGrid: SudokuGridType;
  onCellChange: (row: number, col: number, value: number | null) => void;
  conflicts: [number, number][];
  selectedCell: { row: number; col: number } | null;
  onCellSelect: (row: number, col: number) => void;
  isSolved: boolean;
}

const Grid: React.FC<GridProps> = (
  { grid, 
    initialGrid, 
    onCellChange, 
    conflicts, 
    selectedCell, 
    onCellSelect,
    isSolved
  }) => {
  return (
    <div className={`sudoku-grid ${isSolved ? 'grid-solved' : ''}`}>
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="sudoku-row">
          {row.map((cellValue, colIndex) => {
            const isEditable = initialGrid[rowIndex][colIndex] === null;
            const isConflict = conflicts.some(c => c[0] === rowIndex && c[1] === colIndex);
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            
            let cellContainerClassName = 'cell-container';
            if ((colIndex + 1) % 3 === 0 && colIndex < 8) {
              cellContainerClassName += ' cell-container-border-right';
            }
            if ((rowIndex + 1) % 3 === 0 && rowIndex < 8) {
              cellContainerClassName += ' cell-container-border-bottom';
            }

            return (
              <div key={`${rowIndex}-${colIndex}`} className={cellContainerClassName}>
                <Cell
                  value={cellValue}
                  isEditable={isEditable}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  onChange={onCellChange}
                  onSelect={onCellSelect} // Pass down from App
                  isConflict={isConflict}
                  isSelected={isSelected}
                  isSolved={isSolved}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Grid;