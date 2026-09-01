import { useTheme } from "@core/ui";
import { useLayoutEffect, useRef, useState } from "react";
import { BOARD_SIZE, type Tile as TileData } from "../util/board";
import { Tile } from "./tile";

export type BoardProps = {
  tiles: TileData[];
};

const MAX_CELL = 80;
const MIN_CELL = 48;
const GAP_PX = 1;
const PADDING_PX = 6;
// board has p-1.5 (6 px each side = 12 px) + 1 px gap between each pair of cols
const boardOverhead = PADDING_PX * 2 + GAP_PX * (BOARD_SIZE - 1);

const EmptyCell = () => {
  const { theme } = useTheme();
  const isNeu = theme === "neumorphism";
  const isMaterial = theme === "material";
  const isCupertino = theme === "cupertino";
  const isCyberpunk = theme === "cyberpunk";

  return (
    <div
      className={`w-full h-full rounded-lg ${
        isNeu
          ? "bg-gray-200 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.15),inset_-2px_-2px_4px_rgba(255,255,255,0.7)]"
          : isMaterial
            ? "bg-gray-100"
            : isCupertino
              ? "bg-[#F2F2F7] border border-[#E5E5EA]"
              : isCyberpunk
                ? "bg-[#1a1a2e] border border-[#00e5ff]/10"
                : "bg-white/20 border border-black/10"
      }`}
    />
  );
};

export const Board = ({ tiles }: BoardProps) => {
  const { theme } = useTheme();
  const isNeu = theme === "neumorphism";
  const isMaterial = theme === "material";
  const isCyberpunk = theme === "cyberpunk";

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(MAX_CELL);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const compute = (w: number) =>
      setCellSize(
        Math.max(
          MIN_CELL,
          Math.min(MAX_CELL, Math.floor((w - boardOverhead) / BOARD_SIZE)),
        ),
      );
    compute(el.clientWidth);
    const ro = new ResizeObserver(([e]) => compute(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const step = cellSize + GAP_PX;
  const contentSize = BOARD_SIZE * cellSize + (BOARD_SIZE - 1) * GAP_PX;
  const boxSize = contentSize + 2 * PADDING_PX;

  return (
    <div ref={wrapperRef} className="w-full flex justify-center touch-none">
      <div
        className={`relative rounded-2xl p-1.5 overflow-hidden ${
          isNeu
            ? "bg-gray-200 shadow-[12px_12px_24px_rgba(0,0,0,0.2),-12px_-12px_24px_rgba(255,255,255,0.7)]"
            : isMaterial
              ? "bg-gray-200 shadow-lg"
              : isCyberpunk
                ? "bg-[#0d0d1a] border border-[#00e5ff]/30 shadow-[0_0_30px_rgba(0,229,255,0.1)] rounded-sm"
                : "bg-white/40 border border-white/50 shadow-2xl backdrop-blur-md"
        }`}
        style={{ width: boxSize, height: boxSize }}
      >
        {/* Static backdrop of empty cell slots — never re-rendered per move. */}
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
          }}
        >
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => (
            <EmptyCell key={i} />
          ))}
        </div>

        {/* Tiles layer, absolutely positioned so moves animate via transform. */}
        <div className="absolute" style={{ top: PADDING_PX, left: PADDING_PX }}>
          {tiles.map((tile) => (
            <Tile
              key={tile.id}
              value={tile.value}
              row={tile.row}
              col={tile.col}
              step={step}
              cellSize={cellSize}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
