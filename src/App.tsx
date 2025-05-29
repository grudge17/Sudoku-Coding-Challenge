import { useState, useEffect, useCallback } from 'react';
import Grid, { type SudokuGridType } from './components/Grid';
import './App.css';
import {
  generateSudoku,
  isSafe,
  checkSolution,
  GRID_SIZE,
} from './utils/sudokuLogic';
import _ from 'lodash';

// Define difficulty levels
const DIFFICULTIES = {
  easy: 0.2,
  medium: 0.5,
  hard: 0.7,
  expert: 0.85, // very few clues
};

function App() {
  const [currentDifficulty, setCurrentDifficulty] = useState<keyof typeof DIFFICULTIES>('medium');
  const [initialGrid, setInitialGrid] = useState<SudokuGridType | null>(null);
  const [grid, setGrid] = useState<SudokuGridType | null>(null);
  const [solution, setSolution] = useState<SudokuGridType | null>(null);
  const [conflicts, setConflicts] = useState<[number, number][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [timer, setTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const newGame = useCallback((difficulty: keyof typeof DIFFICULTIES = currentDifficulty) => {
    const { puzzle, solution: fullSolution } = generateSudoku(DIFFICULTIES[difficulty]);
    setInitialGrid(_.cloneDeep(puzzle));
    setGrid(_.cloneDeep(puzzle));
    setSolution(_.cloneDeep(fullSolution));
    setIsSolved(false);
    setConflicts([]);
    setSelectedCell(null);
    setStatusMessage(`New ${difficulty} game started!`);
    setTimer(0);
    setIsTimerRunning(true);
  }, [currentDifficulty]);

  useEffect(() => {
    newGame(); // Start a new game on initial load
  }, [newGame]);

  useEffect(() => {
    let intervalId: number | null = null; // Changed NodeJS.Timeout to number for browser environment
    if (isTimerRunning && !isSolved) {
      intervalId = window.setInterval(() => { // Use window.setInterval for clarity
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else if (intervalId) {
      window.clearInterval(intervalId); // Use window.clearInterval
    }
    return () => {
      if (intervalId) window.clearInterval(intervalId); // Use window.clearInterval
    };
  }, [isTimerRunning, isSolved]);

  const handleCellChange = (row: number, col: number, value: number | null) => {
    if (!grid || !initialGrid || isSolved) return;

    const newGrid = _.cloneDeep(grid);
    newGrid[row][col] = value;
    setGrid(newGrid);

    // Check for immediate conflicts based on Sudoku rules (not against the solution yet)
    const currentConflicts: [number, number][] = [];
    if (value !== null && !isSafe(newGrid, row, col, value)) {
      currentConflicts.push([row, col]); // The cell itself is a conflict
      // Add other cells involved in the conflict (e.g., the other identical number in the row/col/subgrid)
      // For simplicity, we'll just mark the current cell for now. A more advanced UI could highlight all involved cells.
    }
    // Check all cells for conflicts to update UI properly
    const allConflicts : [number, number][]= [];
    for(let r = 0; r < GRID_SIZE; r++) {
      for(let c = 0; c < GRID_SIZE; c++) {
        if(newGrid[r][c] !== null && !isSafe(newGrid, r, c, newGrid[r][c])) {
          allConflicts.push([r,c]);
        }
      }
    }
    setConflicts(allConflicts);

    // Check if the puzzle is solved with this move
    if (value !== null && solution) {
      const result = checkSolution(newGrid, solution);
      if (result.isCorrect && result.isComplete) {
        setIsSolved(true);
        setIsTimerRunning(false);
        setStatusMessage(`Congratulations! Solved in ${formatTime(timer)}.`);
        setConflicts([]); // Clear conflicts on solve
      } else if (allConflicts.length === 0 && !result.isComplete) {
        setStatusMessage('Keep going!');
      } else if (allConflicts.length > 0) {
        setStatusMessage('There are conflicts on the board.');
      }
    }
  };

  const handleSolve = () => {
    if (solution) {
      setGrid(_.cloneDeep(solution));
      setIsSolved(true);
      setIsTimerRunning(false);
      setConflicts([]);
      setStatusMessage('Puzzle solved!');
    }
  };

  const handleCheck = () => {
    if (!grid || !solution) return;
    const result = checkSolution(grid, solution);
    if (result.isCorrect && result.isComplete) {
      setIsSolved(true);
      setIsTimerRunning(false);
      setStatusMessage(`Congratulations! Solved in ${formatTime(timer)}.`);
      setConflicts([]);
    } else if (result.isCorrect && !result.isComplete) {
      setStatusMessage('So far so good, but not complete yet.');
      setConflicts([]);
    } else if (!result.isCorrect && result.firstError) {
        const [r,c] = result.firstError;
        setStatusMessage(`There's an error at row ${r+1}, col ${c+1}.`);
        setConflicts([[r,c]]); // Highlight the first error found by checkSolution
    } else if (!result.isCorrect) {
        setStatusMessage('There are errors on the board.');
        // Potentially run a full conflict check here if checkSolution doesn't provide one
    }
  };

  const handleHint = () => {
    if (!grid || !solution || isSolved) return;
    const emptyCells: [number, number][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === null) {
          emptyCells.push([r, c]);
        }
      }
    }

    if (emptyCells.length > 0) {
      const randomIndex = _.random(0, emptyCells.length - 1);
      const [hintRow, hintCol] = emptyCells[randomIndex];
      const hintValue = solution[hintRow][hintCol];
      
      const newGrid = _.cloneDeep(grid);
      newGrid[hintRow][hintCol] = hintValue;
      setGrid(newGrid);
      setStatusMessage(`Hint: Cell (${hintRow + 1}, ${hintCol + 1}) is ${hintValue}`);
      // Re-check conflicts after hint
      const allConflicts : [number, number][]= [];
      for(let r = 0; r < GRID_SIZE; r++) {
        for(let c = 0; c < GRID_SIZE; c++) {
          if(newGrid[r][c] !== null && !isSafe(newGrid, r, c, newGrid[r][c])) {
            allConflicts.push([r,c]);
          }
        }
      }
      setConflicts(allConflicts);

      // Check if solved after hint
      const result = checkSolution(newGrid, solution);
      if (result.isCorrect && result.isComplete) {
        setIsSolved(true);
        setIsTimerRunning(false);
        setStatusMessage(`Congratulations! Solved with a hint in ${formatTime(timer)}.`);
      }
    } else {
      setStatusMessage('No empty cells to give a hint!');
    }
  };

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleCellSelect = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };

  if (!grid || !initialGrid || !solution) {
    return <div>Loading Sudoku...</div>; // Or a spinner
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sudoku Game</h1>
        <div className="difficulty-selector">
          <label htmlFor="difficulty">Difficulty: </label>
          <select 
            id="difficulty" 
            value={currentDifficulty} 
            onChange={(e) => {
              const newDiff = e.target.value as keyof typeof DIFFICULTIES;
              setCurrentDifficulty(newDiff);
              newGame(newDiff); // Pass the new difficulty directly
            }}
          >
            {Object.keys(DIFFICULTIES).map(level => (
              <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
            ))}
          </select>
        </div>
      </header>
      <main>
        <div className="game-info">
          <div className="timer">Time: {formatTime(timer)}</div>
          <div className="status-message">{statusMessage}</div>
        </div>
        <Grid 
          grid={grid} 
          initialGrid={initialGrid} 
          onCellChange={handleCellChange} 
          conflicts={conflicts}
          selectedCell={selectedCell}
          onCellSelect={handleCellSelect} // Correctly pass the new handler
          isSolved={isSolved}
        />
        <div className="controls">
          <button onClick={() => newGame(currentDifficulty)} disabled={!isTimerRunning && !isSolved && timer === 0}>New Game</button>
          <button onClick={handleCheck} disabled={isSolved || !isTimerRunning}>Check</button>
          <button onClick={handleHint} disabled={isSolved || !isTimerRunning}>Hint</button>
          <button onClick={handleSolve} disabled={isSolved || !isTimerRunning}>Solve</button>
        </div>
        {/* Number Palette could go here */}
      </main>
    </div>
  );
}

export default App;
