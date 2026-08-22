import type { FC, HTMLAttributes, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../theme/theme-context";

export type DialogProps = HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  closeOnBackdropClick?: boolean;
};

export const Dialog: FC<DialogProps> = ({
  open,
  onClose,
  title,
  closeOnBackdropClick = true,
  children,
  className = "",
  ...props
}) => {
  const { theme } = useTheme();
  const isNeu = theme === "neumorphism";
  const isMaterial = theme === "material";
  const isCupertino = theme === "cupertino";
  const isCyberpunk = theme === "cyberpunk";

  if (!open) return null;

  const panelClasses = isNeu
    ? "bg-gray-200 rounded-2xl border border-gray-200 shadow-[12px_12px_24px_rgba(0,0,0,0.2),-12px_-12px_24px_rgba(255,255,255,0.7)] p-8 min-w-[20rem]"
    : isMaterial
      ? "bg-white rounded-lg shadow-2xl p-8 min-w-[20rem]"
      : isCupertino
        ? "bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#E5E5EA] p-8 min-w-[20rem]"
        : isCyberpunk
          ? "bg-[#0d0d1a] rounded-sm border border-[#00e5ff]/60 shadow-[0_0_40px_rgba(0,229,255,0.15),inset_0_0_40px_rgba(0,229,255,0.03)] p-8 min-w-[20rem]"
          : "bg-white/30 border border-white/50 backdrop-blur-2xl rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.15)] p-8 min-w-[20rem]";

  return createPortal(
    <div
      className={`fixed inset-0 z-999 flex items-center justify-center ${
        isNeu
          ? "bg-gray-400/30"
          : isMaterial
            ? "bg-black/50"
            : isCupertino
              ? "bg-black/40 backdrop-blur-sm"
              : isCyberpunk
                ? "bg-black/75"
                : "bg-black/30 backdrop-blur-sm"
      }`}
      onClick={() => {
        if (closeOnBackdropClick) onClose?.();
      }}
    >
      <div
        className={`${panelClasses} ${className}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
        style={isCyberpunk ? { color: '#c0c0d0' } : undefined}
      >
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-xl font-bold ${isCyberpunk ? "text-[#00e5ff] font-mono tracking-wide" : "text-gray-800"}`}>{title}</h2>
            {onClose && (
              <button
                className={`cursor-pointer transition-colors ${isCyberpunk ? "text-[#4a4a6a] hover:text-[#00e5ff]" : "text-gray-500 hover:text-gray-800"}`}
                onClick={onClose}
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
};
