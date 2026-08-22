import { useTheme } from "@core/ui";
import { useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";

const MEMO_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export type BoardCellProps = {
  value: number;
  memo?: string[];
  isGiven?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isInvalid?: boolean;
  hintNumber?: number | null;
  onSelect?: () => void;
  onChange?: (newValue: number, newMemo?: string[]) => void;
};

export const BoardCell = ({
  value,
  memo,
  isGiven,
  isSelected,
  isHighlighted,
  isInvalid,
  hintNumber,
  onSelect,
  onChange,
}: BoardCellProps) => {
  const cellRef = useRef<HTMLDivElement>(null);
  const [memoPopupRect, setMemoPopupRect] = useState<{
    top: number;
    bottom: number;
    left: number;
    width: number;
  } | null>(null);

  const { theme } = useTheme();
  const isNeu = theme === "neumorphism";
  const isMaterial = theme === "material";
  const isCupertino = theme === "cupertino";
  const isCyberpunk = theme === "cyberpunk";

  const bgClass = isInvalid
    ? isNeu
      ? "bg-red-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]"
      : isCupertino
        ? "bg-red-50"
        : isCyberpunk
          ? "bg-[#ff4444]/10"
          : "bg-red-100"
    : isNeu
      ? isGiven
        ? "bg-gray-200 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.15),inset_-2px_-2px_4px_rgba(255,255,255,0.7)]"
        : isSelected
          ? "bg-blue-100 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.15),inset_-3px_-3px_6px_rgba(255,255,255,0.6)]"
          : isHighlighted
            ? "bg-sky-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.6)]"
            : "bg-gray-200 hover:brightness-105"
      : isMaterial
        ? isGiven
          ? "bg-gray-100"
          : isSelected
            ? "bg-blue-100"
            : isHighlighted
              ? "bg-sky-100"
              : "bg-white hover:bg-gray-50"
        : isCupertino
          ? isGiven
            ? "bg-[#F2F2F7]"
            : isSelected
              ? "bg-[#007AFF]/15"
              : isHighlighted
                ? "bg-[#007AFF]/10"
                : "bg-white hover:bg-[#F2F2F7]"
          : isCyberpunk
            ? isGiven
              ? "bg-[#1a1a2e]"
              : isSelected
                ? "bg-[#ff2d78]/10"
                : isHighlighted
                  ? "bg-[#00e5ff]/8"
                  : "bg-[#12121f] hover:bg-[#1a1a2e]"
            : isGiven
              ? "bg-white/40"
              : isSelected
                ? "bg-blue-300/50"
                : isHighlighted
                  ? "bg-sky-300/40"
                  : "bg-white/15 hover:bg-white/25";

  const handleClick = () => {
    onSelect?.();
    if (hintNumber && !isGiven && value === 0) onChange?.(hintNumber, memo);
  };

  const handleRightClick = (e: MouseEvent) => {
    e.preventDefault();
    if (isGiven) return;
    if (hintNumber && value === 0) {
      const newMemo = memo?.includes(hintNumber.toString())
        ? memo.filter((m) => m !== hintNumber.toString())
        : [...(memo ?? []), hintNumber.toString()];
      onChange?.(value, newMemo);
      return;
    }
    const rect = cellRef.current?.getBoundingClientRect();
    if (rect) setMemoPopupRect({ top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width });
  };

  const memoButtonClass = (selected: boolean) => {
    if (isNeu)
      return selected
        ? "bg-gray-200 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.7)]"
        : "bg-gray-200 shadow-[2px_2px_4px_rgba(0,0,0,0.15),-2px_-2px_4px_rgba(255,255,255,0.7)] hover:brightness-105";
    if (isMaterial) return selected ? "bg-blue-100 text-blue-700" : "bg-gray-50 hover:bg-gray-100";
    if (isCupertino) return selected ? "bg-[#007AFF] text-white" : "bg-[#F2F2F7] hover:bg-[#E5E5EA]";
    if (isCyberpunk)
      return selected
        ? "bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff] shadow-[0_0_6px_rgba(0,229,255,0.4)]"
        : "bg-[#12121f] text-[#4a6a8a] border border-[#4a4a6a]/30 hover:border-[#00e5ff]/50 hover:text-[#00e5ff]";
    return selected ? "border border-white/40 bg-blue-300/50" : "border border-white/40 bg-white/20 hover:bg-white/40";
  };

  const popupClass = isNeu
    ? "bg-gray-200 shadow-[8px_8px_16px_rgba(0,0,0,0.25),-8px_-8px_16px_rgba(255,255,255,0.7)]"
    : isMaterial
      ? "bg-white shadow-xl"
      : isCupertino
        ? "bg-white/95 backdrop-blur-xl border border-[#E5E5EA] shadow-lg"
        : isCyberpunk
          ? "bg-[#0d0d1a] border border-[#00e5ff]/60 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
          : "bg-white/40 backdrop-blur-2xl border border-white/50 shadow-xl";

  return (
    <div
      ref={cellRef}
      className={`w-12 h-12 flex flex-col items-center justify-center relative transition-colors duration-150 ${
        isNeu || isMaterial || isCupertino || isCyberpunk ? "" : "backdrop-blur-md"
      } ${bgClass}`}
      onContextMenu={handleRightClick}
      onClick={handleClick}
    >
      {isGiven ? (
        <span className={`font-bold select-none ${isCyberpunk ? "text-[#00e5ff] font-mono" : "text-gray-800"}`}>
          {value}
        </span>
      ) : (
        <input
          style={{ width: "100%", height: "100%", textAlign: "center" }}
          className={`bg-transparent relative z-10 font-semibold outline-none ${
            isInvalid ? "text-red-500" : isCyberpunk ? "text-[#e0e0ff] font-mono" : "text-gray-900"
          }`}
          type="text"
          value={value === 0 ? "" : value}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v >= 1 && v <= 9) onChange?.(v, memo);
            else if (e.target.value === "") onChange?.(0, memo);
          }}
        />
      )}

      {value === 0 && memo && memo.length > 0 && (
        <div className={`grid grid-cols-3 grid-rows-3 w-full h-full pointer-events-none text-[0.55rem] leading-none absolute inset-0 ${isCyberpunk ? "text-[#4a6a8a]" : "text-gray-600"}`}>
          {MEMO_NUMS.map((num) => (
            <div key={num} className="flex items-center justify-center">
              {memo.includes(num.toString()) ? num : ""}
            </div>
          ))}
        </div>
      )}

      {memoPopupRect &&
        !isGiven &&
        createPortal(
          (() => {
            const POPUP_HEIGHT = 124;
            const top =
              window.innerHeight - memoPopupRect.bottom >= POPUP_HEIGHT + 6
                ? memoPopupRect.bottom + 6
                : memoPopupRect.top - POPUP_HEIGHT - 6;
            return (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMemoPopupRect(null)} />
                <dialog
                  open
                  className={`fixed p-2 z-50 w-fit h-fit rounded-xl ${popupClass}`}
                  style={{
                    top,
                    left: memoPopupRect.left + memoPopupRect.width / 2,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="grid grid-cols-3 gap-1 w-max h-max">
                    {MEMO_NUMS.map((num) => {
                      const sel = memo?.includes(num.toString()) ?? false;
                      return (
                        <button
                          key={num}
                          className={`rounded-md w-8 h-8 flex items-center justify-center font-medium text-gray-800 transition-colors cursor-pointer ${memoButtonClass(sel)}`}
                          onClick={() => {
                            const newMemo = sel
                              ? memo!.filter((m) => m !== num.toString())
                              : [...(memo ?? []), num.toString()];
                            onChange?.(value, newMemo);
                          }}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </dialog>
              </>
            );
          })(),
          document.body,
        )}
    </div>
  );
};
