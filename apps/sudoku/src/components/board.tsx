import { useTheme } from "@core/ui";
import { shouldHighlightCell } from "../util/sudoku-validation";
import { BoardCell } from "./board-cell";

export type BoardProps = {
  board: number[][];
  memo?: string[][][];
  given?: boolean[][];
  invalidCells?: boolean[][];
  status?: "playing" | "paused" | "completed";
  hoveredNumber?: number | null;
  hintNumber?: number | null;
  selected?: { row: number; col: number } | null;
  onSelectCell?: (row: number, col: number) => void;
  onCellChange?: (row: number, col: number, newValue: number, newMemo?: string[]) => void;
};

const CELL_SIZE = 48;  // px, matches w-12/h-12
const DIVIDER_SIZE = 6; // px
const BOARD_PADDING = 6; // px, matches p-1.5
const BOARD_SIZE = CELL_SIZE * 9 + DIVIDER_SIZE * 2 + BOARD_PADDING * 2;

const trackSizes = Array.from({ length: 11 }, (_, i) =>
  i === 3 || i === 7 ? `${DIVIDER_SIZE}px` : `${CELL_SIZE}px`,
).join(" ");

const trackPosition = (i: number) => i + 1 + Math.floor(i / 3);

export const Board = ({
  board,
  memo,
  given,
  invalidCells,
  status,
  hoveredNumber,
  hintNumber,
  selected,
  onSelectCell,
  onCellChange,
}: BoardProps) => {
  const { theme } = useTheme();
  const isNeu = theme === "neumorphism";
  const isMaterial = theme === "material";
  const isCyberpunk = theme === "cyberpunk";

  if (status === "paused") {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl font-semibold text-lg ${
          isNeu
            ? "bg-gray-200 text-gray-700 shadow-[12px_12px_24px_rgba(0,0,0,0.2),-12px_-12px_24px_rgba(255,255,255,0.7)]"
            : isMaterial
              ? "bg-white text-gray-700 shadow-lg"
              : isCyberpunk
                ? "bg-[#12121f] text-[#00e5ff] border border-[#00e5ff]/30"
                : "text-gray-700 border border-white/50 bg-white/30 backdrop-blur-md shadow-2xl"
        }`}
        style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
      >
        Game paused
      </div>
    );
  }

  const displayedNumber = hintNumber ?? hoveredNumber;

  return (
    <div
      className={`rounded-2xl p-1.5 overflow-hidden ${
        isNeu
          ? "bg-gray-200 shadow-[12px_12px_24px_rgba(0,0,0,0.2),-12px_-12px_24px_rgba(255,255,255,0.7)]"
          : isMaterial
            ? "bg-white shadow-lg"
            : isCyberpunk
              ? "bg-[#0d0d1a] border border-[#00e5ff]/30 shadow-[0_0_30px_rgba(0,229,255,0.1)] rounded-sm"
              : "bg-white/40 border border-white/50 shadow-2xl backdrop-blur-md"
      }`}
      style={{ display: "grid", gridTemplateColumns: trackSizes, gridTemplateRows: trackSizes }}
    >
      {board?.map((row, rowIndex) =>
        row?.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            style={{ gridColumn: trackPosition(colIndex), gridRow: trackPosition(rowIndex) }}
          >
            <BoardCell
              value={cell}
              memo={memo?.[rowIndex]?.[colIndex]}
              isGiven={given?.[rowIndex]?.[colIndex]}
              isInvalid={invalidCells?.[rowIndex]?.[colIndex]}
              isSelected={selected?.row === rowIndex && selected?.col === colIndex}
              isHighlighted={
                !!displayedNumber && shouldHighlightCell(board, rowIndex, colIndex, displayedNumber)
              }
              hintNumber={hintNumber}
              onSelect={() => onSelectCell?.(rowIndex, colIndex)}
              onChange={(newValue, newMemo) => onCellChange?.(rowIndex, colIndex, newValue, newMemo)}
            />
          </div>
        )),
      )}
    </div>
  );
};
