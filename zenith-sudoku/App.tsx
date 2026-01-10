import React, { useState, useEffect, useCallback, useRef } from "react";
import SudokuCell from "./components/SudokuCell";
import Controls from "./components/Controls";
import { generateGame, createEmptyGrid } from "./utils/sudokuGenerator";
import { Difficulty, Grid, CellCoords } from "./types";

function App() {
  // Game State
  const [initialGrid, setInitialGrid] = useState<Grid>(createEmptyGrid());
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [solvedGrid, setSolvedGrid] = useState<Grid>(createEmptyGrid());
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [selectedCell, setSelectedCell] = useState<CellCoords | null>(null);
  const [history, setHistory] = useState<Grid[]>([]);

  // Stats
  const [mistakes, setMistakes] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Loading state
  const [isGenerating, setIsGenerating] = useState(false);

  // Debounce reference
  const difficultyTimeoutRef = useRef<number | null>(null);

  // Initialize Game with async generation and loading state
  const startNewGame = useCallback(
    (diff: Difficulty = difficulty) => {
      setIsGenerating(true);

      // Use setTimeout to show loading state for 1 second
      setTimeout(() => {
        try {
          const { initial, solved } = generateGame(diff);
          setInitialGrid(initial);
          // Deep copy for playable grid
          const playable = JSON.parse(JSON.stringify(initial));
          setGrid(playable);
          setSolvedGrid(solved);
          setHistory([]);
          setMistakes(0);
          setTimeElapsed(0);
          setIsWon(false);
          setIsTimerActive(true);
          setSelectedCell(null);
        } catch (error) {
          console.error("Error generating game:", error);
        } finally {
          setIsGenerating(false);
        }
      }, 1000); // 1 second loading duration
    },
    [difficulty]
  );

  // Initial Load
  useEffect(() => {
    startNewGame(difficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer
  useEffect(() => {
    let interval: number;
    if (isTimerActive && !isWon && !isGenerating) {
      interval = window.setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, isWon, isGenerating]);

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || isWon || isGenerating) return;

      const { row, col } = selectedCell;
      const key = e.key;

      if (key >= "1" && key <= "9") {
        handleNumberInput(parseInt(key));
      } else if (key === "Backspace" || key === "Delete") {
        handleNumberInput(0);
      } else if (key.startsWith("Arrow")) {
        e.preventDefault();
        let newRow = row;
        let newCol = col;
        if (key === "ArrowUp") newRow = Math.max(0, row - 1);
        if (key === "ArrowDown") newRow = Math.min(8, row + 1);
        if (key === "ArrowLeft") newCol = Math.max(0, col - 1);
        if (key === "ArrowRight") newCol = Math.min(8, col + 1);
        setSelectedCell({ row: newRow, col: newCol });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCell, isWon, grid, isGenerating]);

  // Check Win Condition
  useEffect(() => {
    if (isGenerating) return;

    if (!grid.some((row) => row.includes(0)) && mistakes < 3) {
      // Check if matches solved grid
      const isCorrect = grid.every((row, r) =>
        row.every((val, c) => val === solvedGrid[r][c])
      );
      if (isCorrect) {
        setIsWon(true);
        setIsTimerActive(false);
      }
    }
  }, [grid, solvedGrid, mistakes, isGenerating]);

  // Actions
  const handleCellClick = (coords: CellCoords) => {
    if (isGenerating) return;
    setSelectedCell(coords);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || isWon || isGenerating) return;
    const { row, col } = selectedCell;

    // Cannot edit initial cells
    if (initialGrid[row][col] !== 0) return;

    // Check if value actually changed
    if (grid[row][col] === num) return;

    // Save history
    setHistory((prev) => [
      ...prev.slice(-20),
      JSON.parse(JSON.stringify(grid)),
    ]);

    // Update Grid
    const newGrid = [...grid];
    newGrid[row] = [...newGrid[row]];
    newGrid[row][col] = num;
    setGrid(newGrid);

    // Validate Move (Instant feedback mode)
    if (num !== 0 && num !== solvedGrid[row][col]) {
      setMistakes((m) => m + 1);
      // Optional: Flash error or just count mistake
      if (mistakes + 1 >= 3) {
        // Game Over logic could go here
      }
    }
  };

  const handleUndo = () => {
    if (history.length === 0 || isWon || isGenerating) return;
    const previousGrid = history[history.length - 1];
    setGrid(previousGrid);
    setHistory((prev) => prev.slice(0, -1));
  };

  // DEBOUNCED difficulty change
  const handleDifficultyChange = (newDiff: Difficulty) => {
    // Clear existing timeout
    if (difficultyTimeoutRef.current) {
      clearTimeout(difficultyTimeoutRef.current);
    }

    // Update difficulty immediately for UI
    setDifficulty(newDiff);

    // Debounce the actual game generation
    difficultyTimeoutRef.current = window.setTimeout(() => {
      startNewGame(newDiff);
    }, 300); // 300ms debounce delay
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (difficultyTimeoutRef.current) {
        clearTimeout(difficultyTimeoutRef.current);
      }
    };
  }, []);

  // Helper for cell rendering logic
  const getCellProps = (row: number, col: number) => {
    const value = grid[row][col];
    const isInitial = initialGrid[row][col] !== 0;
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;

    let isRelated = false;
    if (selectedCell) {
      const sRow = selectedCell.row;
      const sCol = selectedCell.col;
      const sBoxRow = sRow - (sRow % 3);
      const sBoxCol = sCol - (sCol % 3);
      const cBoxRow = row - (row % 3);
      const cBoxCol = col - (col % 3);

      isRelated =
        row === sRow ||
        col === sCol ||
        (sBoxRow === cBoxRow && sBoxCol === cBoxCol);
    }

    const isSameValue =
      selectedCell &&
      grid[selectedCell.row][selectedCell.col] !== 0 &&
      value === grid[selectedCell.row][selectedCell.col];
    const isError = value !== 0 && value !== solvedGrid[row][col];

    return {
      value,
      coords: { row, col },
      isInitial,
      isSelected,
      isRelated,
      isSameValue: !!isSameValue,
      isError,
      onClick: handleCellClick,
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              Z
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Zenith Sudoku
            </h1>
          </div>
          {isWon && (
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold animate-pulse">
              Puzzle Solved!
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-center">
        {/* Board Section */}
        <div className="w-full max-w-md mx-auto lg:mx-0 shadow-xl rounded-xl overflow-hidden border-4 border-slate-800 bg-slate-800 relative">
          {/* Loading Overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {/* Spinning loader */}
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  {/* Inner pulse */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-indigo-600 font-semibold text-lg">
                    Generating Puzzle...
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
                    {difficulty} difficulty
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-9 gap-[1px] bg-slate-300">
            {grid.map((row, rIndex) =>
              row.map((_, cIndex) => (
                <SudokuCell
                  key={`${rIndex}-${cIndex}`}
                  {...getCellProps(rIndex, cIndex)}
                />
              ))
            )}
          </div>
        </div>

        {/* Controls Section */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:w-80 flex-shrink-0">
          <Controls
            difficulty={difficulty}
            setDifficulty={handleDifficultyChange}
            onNewGame={() => startNewGame(difficulty)}
            onNumberClick={handleNumberInput}
            onDelete={() => handleNumberInput(0)}
            onUndo={handleUndo}
            mistakes={mistakes}
            timeElapsed={timeElapsed}
            isGenerating={isGenerating}
          />

          <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-sm text-indigo-800">
            <h4 className="font-bold mb-1">How to play</h4>
            <p className="opacity-80">
              Fill the grid so that every row, column, and 3x3 box contains the
              digits 1 through 9. Good luck!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
