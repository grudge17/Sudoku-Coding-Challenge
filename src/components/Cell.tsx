// src/components/Cell.tsx
import React from 'react';
import './Cell.css';

interface CellProps {
  value: number | null;
  isEditable: boolean;
  rowIndex: number;
  colIndex: number;
  onChange: (row: number, col: number, value: number | null) => void;
  onSelect: (row: number, col: number) => void; // For selecting a cell
  isConflict: boolean;
  isSelected: boolean;
  isSolved: boolean; // To disable input when solved
}

const Cell: React.FC<CellProps> = (
  { value, 
    isEditable, 
    rowIndex, 
    colIndex, 
    onChange, 
    onSelect, 
    isConflict,
    isSelected,
    isSolved 
  }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSolved) return; // Don't allow changes if solved
    const inputValue = e.target.value;
    // Allow only single digits 1-9 or empty string
    if (inputValue === '' || (/^[1-9]$/.test(inputValue) && inputValue.length === 1)) {
      onChange(rowIndex, colIndex, inputValue === '' ? null : parseInt(inputValue, 10));
    } else if (inputValue.length > 1 && /^[1-9]$/.test(inputValue.slice(-1))){
      // If user types quickly, sometimes multiple digits are entered, take the last valid one
      onChange(rowIndex, colIndex, parseInt(inputValue.slice(-1), 10));
    } else if (value !== null && inputValue.length === 0) {
      // Handles backspace/delete to clear the cell
      onChange(rowIndex, colIndex, null);
    }
  };

  const handleFocus = () => {
    if (!isSolved) {
      onSelect(rowIndex, colIndex);
    }
  };

  let className = 'cell';
  if (!isEditable) className += ' cell-fixed';
  if (isConflict) className += ' cell-conflict';
  if (isSelected && isEditable && !isSolved) className += ' cell-selected';
  if (isSolved && isEditable) className += ' cell-solved-editable'; // Style for user-entered cells when solved

  return (
    <input
      type="text" // Using text to better control input, could be "tel" for number pad on mobile
      className={className}
      value={value === null ? '' : value.toString()}
      readOnly={!isEditable || isSolved}
      onChange={handleChange}
      onFocus={handleFocus}
      maxLength={1} // Enforced by logic too, but good to have
      inputMode={isEditable && !isSolved ? "numeric" : "none"} // Helps with mobile keyboards
      pattern={isEditable && !isSolved ? "[1-9]*" : undefined} // Helps with mobile keyboards
    />
  );
};

export default Cell;
