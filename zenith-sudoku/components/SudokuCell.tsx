import React from "react";
import { CellCoords } from "../types";

interface SudokuCellProps {
  value: number;
  coords: CellCoords;
  isInitial: boolean;
  isSelected: boolean;
  isRelated: boolean; // Same row/col/box
  isSameValue: boolean; // Contains same number as selected
  isError: boolean;
  onClick: (coords: CellCoords) => void;
}

const SudokuCell: React.FC<SudokuCellProps> = ({
  value,
  coords,
  isInitial,
  isSelected,
  isRelated,
  isSameValue,
  isError,
  onClick,
}) => {
  const { row, col } = coords;

  // Determine border classes for 3x3 grid visualization
  const borderRight =
    (col + 1) % 3 === 0 && col !== 8
      ? "border-r-2 border-r-slate-800"
      : "border-r border-r-slate-300";
  const borderBottom =
    (row + 1) % 3 === 0 && row !== 8
      ? "border-b-2 border-b-slate-800"
      : "border-b border-b-slate-300";

  // Base classes
  let bgClass = "bg-white";
  let textClass = isInitial
    ? "text-slate-900 font-bold"
    : "text-indigo-600 font-medium";

  // State-based styling (Priority: Error > Selected > SameValue > Related > Default)
  if (isError) {
    bgClass = "bg-red-100 text-red-600";
  } else if (isSelected) {
    bgClass = "bg-indigo-500 text-white";
    textClass = "text-white font-bold"; // Override for contrast
  } else if (isSameValue && value !== 0) {
    bgClass = "bg-indigo-200";
  } else if (isRelated) {
    bgClass = "bg-slate-100";
  }

  return (
    <div
      onClick={() => onClick(coords)}
      className={`
        w-full h-full aspect-square flex items-center justify-center text-xl sm:text-2xl cursor-pointer select-none transition-colors duration-100
        ${borderRight} ${borderBottom}
        ${bgClass} ${textClass}
        ${col === 0 ? "border-l-2 border-l-slate-800" : ""}
        ${row === 0 ? "border-t-2 border-t-slate-800" : ""}
        ${col === 8 ? "border-r-2 border-r-slate-800" : ""}
        ${row === 8 ? "border-b-2 border-b-slate-800" : ""}
      `}
      role="gridcell"
      aria-label={`Row ${row + 1}, Column ${col + 1}, Value ${
        value === 0 ? "Empty" : value
      }`}
    >
      {value !== 0 ? value : ""}
    </div>
  );
};

export default React.memo(SudokuCell);
