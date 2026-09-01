import { useTheme, type UiTheme } from "@core/ui";

export type TileProps = {
  value: number;
  row: number;
  col: number;
  /** Pixel distance between adjacent cells' top-left corners. */
  step: number;
  cellSize: number;
};

// Keep in sync with the `duration-200` class below.
export const TILE_ANIMATION_MS = 200;

// Value -> palette index; each theme gets its own 11-color progression so
// every tile value is visually distinct while staying on that theme's palette.
const VALUE_ORDER = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];

// Shared visual treatment applied to every filled tile within a theme (the
// per-value colors below only vary background/text/accent).
const TILE_WRAPPER: Record<UiTheme, string> = {
  glass: "border border-white/40 shadow-md backdrop-blur-sm",
  neumorphism:
    "shadow-[3px_3px_6px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(255,255,255,0.7)]",
  material: "shadow-md",
  cupertino: "shadow-sm",
  cyberpunk: "",
};

const TILE_COLORS: Record<UiTheme, string[]> = {
  glass: [
    "bg-indigo-200/70 text-indigo-900",
    "bg-indigo-300/70 text-indigo-900",
    "bg-sky-300/70 text-sky-950",
    "bg-sky-400/70 text-white",
    "bg-teal-400/70 text-white",
    "bg-emerald-400/70 text-white",
    "bg-amber-400/80 text-amber-950",
    "bg-orange-400/80 text-white",
    "bg-rose-400/80 text-white",
    "bg-pink-500/80 text-white",
    "bg-fuchsia-600/85 text-white",
  ],
  neumorphism: [
    "bg-blue-100 text-gray-800",
    "bg-blue-200 text-gray-800",
    "bg-teal-200 text-gray-800",
    "bg-teal-300 text-gray-800",
    "bg-emerald-300 text-gray-800",
    "bg-lime-300 text-gray-800",
    "bg-amber-300 text-gray-800",
    "bg-orange-300 text-white",
    "bg-rose-300 text-white",
    "bg-pink-400 text-white",
    "bg-purple-400 text-white",
  ],
  material: [
    "bg-blue-100 text-blue-900",
    "bg-blue-300 text-blue-900",
    "bg-cyan-500 text-white",
    "bg-teal-500 text-white",
    "bg-green-500 text-white",
    "bg-lime-500 text-gray-900",
    "bg-yellow-500 text-gray-900",
    "bg-amber-600 text-white",
    "bg-orange-600 text-white",
    "bg-red-600 text-white",
    "bg-purple-700 text-white",
  ],
  cupertino: [
    "bg-[#E8F0FE] text-[#007AFF]",
    "bg-[#CFE4FF] text-[#007AFF]",
    "bg-[#34C759] text-white",
    "bg-[#30B0C7] text-white",
    "bg-[#5AC8FA] text-white",
    "bg-[#FFD60A] text-[#3a2f00]",
    "bg-[#FF9F0A] text-white",
    "bg-[#FF453A] text-white",
    "bg-[#BF5AF2] text-white",
    "bg-[#FF375F] text-white",
    "bg-[#5E5CE6] text-white",
  ],
  cyberpunk: [
    "bg-[#0d1a1a] text-[#00e5ff] border border-[#00e5ff]/50 shadow-[0_0_8px_rgba(0,229,255,0.35)]",
    "bg-[#0d0f1a] text-[#3d8bff] border border-[#3d8bff]/50 shadow-[0_0_8px_rgba(61,139,255,0.35)]",
    "bg-[#150d1a] text-[#b026ff] border border-[#b026ff]/50 shadow-[0_0_8px_rgba(176,38,255,0.35)]",
    "bg-[#1a0d17] text-[#ff2d78] border border-[#ff2d78]/50 shadow-[0_0_8px_rgba(255,45,120,0.35)]",
    "bg-[#1a0d10] text-[#ff00e5] border border-[#ff00e5]/50 shadow-[0_0_8px_rgba(255,0,229,0.35)]",
    "bg-[#1a0d0d] text-[#ff3b3b] border border-[#ff3b3b]/50 shadow-[0_0_8px_rgba(255,59,59,0.35)]",
    "bg-[#1a120d] text-[#ff6a00] border border-[#ff6a00]/50 shadow-[0_0_8px_rgba(255,106,0,0.35)]",
    "bg-[#1a170d] text-[#ffd60a] border border-[#ffd60a]/50 shadow-[0_0_8px_rgba(255,214,10,0.35)]",
    "bg-[#171a0d] text-[#aaff00] border border-[#aaff00]/50 shadow-[0_0_8px_rgba(170,255,0,0.35)]",
    "bg-[#0d1a12] text-[#00ffab] border border-[#00ffab]/50 shadow-[0_0_8px_rgba(0,255,171,0.35)]",
    "bg-black text-white border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.8)]",
  ],
};

const TILE_FALLBACK: Record<UiTheme, string> = {
  glass: "bg-violet-700/85 text-white",
  neumorphism: "bg-indigo-500 text-white",
  material: "bg-gray-900 text-white",
  cupertino: "bg-[#1C1C1E] text-white",
  cyberpunk:
    "bg-[#1a0008] text-[#ff0044] border-2 border-[#ff0044] shadow-[0_0_20px_rgba(255,0,68,0.8)]",
};

export const Tile = ({ value, row, col, step, cellSize }: TileProps) => {
  const { theme } = useTheme();

  const index = VALUE_ORDER.indexOf(value);
  const colorClass =
    index >= 0 ? TILE_COLORS[theme][index] : TILE_FALLBACK[theme];
  const fontSizeClass = value >= 1000 ? "text-lg" : "text-2xl";

  return (
    <div
      className={`absolute top-0 left-0 flex items-center justify-center rounded-lg font-bold select-none transition-transform duration-200 ease-in-out ${fontSizeClass} ${TILE_WRAPPER[theme]} ${colorClass}`}
      style={{
        width: cellSize,
        height: cellSize,
        transform: `translate(${col * step}px, ${row * step}px)`,
      }}
    >
      {value}
    </div>
  );
};
