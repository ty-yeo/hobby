import { useTheme } from "@core/ui";

export type NumberHintBarProps = {
  board?: number[][];
  activeNumber?: number | null;
  onHover?: (num: number | null) => void;
  onClickNumber?: (num: number) => void;
};

const NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const isNumberComplete = (board: number[][] | undefined, num: number) => {
  if (!board) return false;
  let count = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r]?.[c] === num) count++;
    }
  }
  return count >= 9;
};

export const NumberHintBar = ({
  board,
  activeNumber,
  onHover,
  onClickNumber,
}: NumberHintBarProps) => {
  const { theme } = useTheme();
  const isNeu = theme === "neumorphism";
  const isMaterial = theme === "material";
  const isCupertino = theme === "cupertino";
  const isCyberpunk = theme === "cyberpunk";

  return (
    <div
      className={`flex justify-center gap-2 mt-4 rounded-2xl p-2 ${
        isNeu
          ? "bg-gray-200 shadow-[8px_8px_16px_rgba(0,0,0,0.15),-8px_-8px_16px_rgba(255,255,255,0.7)]"
          : isMaterial
            ? "bg-white shadow-md"
            : isCupertino
              ? "bg-white border border-[#E5E5EA] shadow-sm"
              : isCyberpunk
                ? "bg-[#12121f] border border-[#00e5ff]/30 shadow-[0_0_15px_rgba(0,229,255,0.08)] rounded-sm"
                : "border border-white/40 bg-white/20 backdrop-blur-md shadow-lg"
      }`}
    >
      {NUMS.map((num) => {
        const complete = isNumberComplete(board, num);
        const isActive = activeNumber === num;
        const neuClasses = complete
          ? "text-gray-400 bg-gray-200 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] cursor-default"
          : isActive
            ? "bg-blue-400 text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.3)] cursor-pointer"
            : "bg-gray-200 text-gray-800 shadow-[3px_3px_6px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(255,255,255,0.7)] hover:brightness-105 cursor-pointer";
        const materialClasses = complete
          ? "text-gray-300 bg-gray-50 cursor-default"
          : isActive
            ? "bg-blue-600 text-white shadow-md cursor-pointer"
            : "bg-gray-50 text-gray-800 hover:bg-blue-50 cursor-pointer";
        const glassClasses = complete
          ? "text-gray-400 bg-gray-200/30 border-white/20 cursor-default"
          : isActive
            ? "bg-blue-400/60 border-white/50 text-white shadow-md cursor-pointer"
            : "bg-white/20 border-white/30 hover:bg-sky-200/50 text-gray-800 cursor-pointer";
        const cupertinoClasses = complete
          ? "text-[#C7C7CC] bg-[#F2F2F7] cursor-default"
          : isActive
            ? "bg-[#007AFF] text-white cursor-pointer"
            : "bg-[#F2F2F7] text-gray-800 hover:bg-[#E5E5EA] cursor-pointer";
        const cyberpunkClasses = complete
          ? "text-[#4a4a6a] bg-[#0d0d1a] border border-[#4a4a6a]/30 cursor-default"
          : isActive
            ? "bg-[#ff2d78]/15 text-[#ff2d78] border border-[#ff2d78] shadow-[0_0_10px_rgba(255,45,120,0.6)] cursor-pointer"
            : "bg-[#12121f] text-[#00e5ff] border border-[#00e5ff]/30 hover:border-[#00e5ff] hover:shadow-[0_0_8px_rgba(0,229,255,0.4)] cursor-pointer";
        return (
          <button
            key={num}
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold transition-all duration-150 ${
              isNeu
                ? neuClasses
                : isMaterial
                  ? materialClasses
                  : isCupertino
                    ? cupertinoClasses
                    : isCyberpunk
                      ? cyberpunkClasses
                      : `border backdrop-blur-md ${glassClasses}`
            }`}
            onMouseEnter={() => !complete && onHover?.(num)}
            onMouseLeave={() => onHover?.(null)}
            onClick={() => !complete && onClickNumber?.(num)}
          >
            {num}
          </button>
        );
      })}
    </div>
  );
};
