import type { ButtonHTMLAttributes, FC } from "react";
import { useTheme } from "../theme/theme-context";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const glassVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-500/70 text-white hover:bg-blue-500/85 active:bg-blue-600/90 border-white/40 shadow-lg shadow-blue-900/10 backdrop-blur-md",
  secondary:
    "bg-white/30 text-gray-900 hover:bg-white/50 active:bg-white/60 border-white/40 shadow-md shadow-black/5 backdrop-blur-md",
  ghost:
    "bg-white/10 text-gray-900 hover:bg-white/30 active:bg-white/40 border-transparent backdrop-blur-md",
  danger:
    "bg-red-500/70 text-white hover:bg-red-500/85 active:bg-red-600/90 border-white/40 shadow-lg shadow-red-900/10 backdrop-blur-md",
};

const glassDisabledClasses =
  "disabled:bg-gray-200/40 disabled:text-gray-400 disabled:border-white/20 disabled:shadow-none disabled:hover:bg-gray-200/40 disabled:active:bg-gray-200/40";

const glassBaseClasses =
  "rounded-xl border transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0";

// Neumorphism: soft matte surface, no borders, dual soft shadows for an
// "extruded" look; active/pressed states use inset shadows instead.
const neuVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-400 text-white shadow-[6px_6px_12px_rgba(0,0,0,0.25),-6px_-6px_12px_rgba(255,255,255,0.5)] hover:brightness-105 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.3)] border-transparent",
  secondary:
    "bg-gray-200 text-gray-800 shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)] hover:brightness-105 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.15),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] border-transparent",
  ghost:
    "bg-gray-200/60 text-gray-800 shadow-none hover:bg-gray-200 hover:shadow-[3px_3px_6px_rgba(0,0,0,0.1),-3px_-3px_6px_rgba(255,255,255,0.6)] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.15),inset_-3px_-3px_6px_rgba(255,255,255,0.6)] border-transparent",
  danger:
    "bg-red-400 text-white shadow-[6px_6px_12px_rgba(0,0,0,0.25),-6px_-6px_12px_rgba(255,255,255,0.5)] hover:brightness-105 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.3)] border-transparent",
};

const neuDisabledClasses =
  "disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] disabled:hover:brightness-100";

const neuBaseClasses = "rounded-xl border-0 transition-all duration-200";

// Material Design: solid fill colors, elevation shadows that grow on hover
// (like Material's resting/hover/pressed elevation levels), no borders.
const materialVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white shadow-md hover:shadow-lg hover:bg-blue-700 active:shadow-sm active:bg-blue-800 border-transparent",
  secondary:
    "bg-white text-blue-700 shadow-sm hover:shadow-md hover:bg-blue-50 active:shadow-none active:bg-blue-100 border-transparent",
  ghost:
    "bg-transparent text-blue-700 shadow-none hover:bg-blue-50 active:bg-blue-100 border-transparent",
  danger:
    "bg-red-600 text-white shadow-md hover:shadow-lg hover:bg-red-700 active:shadow-sm active:bg-red-800 border-transparent",
};

const materialDisabledClasses =
  "disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:hover:bg-gray-200 disabled:hover:shadow-none disabled:active:bg-gray-200";

const materialBaseClasses =
  "rounded-md border-0 transition-all duration-150 uppercase text-sm tracking-wide";

// Cupertino (iOS): iOS system colors, rounded rectangles, no borders on filled buttons
const cupertinoVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#007AFF] text-white hover:bg-[#0071EB] active:bg-[#0062CC] border-transparent shadow-sm",
  secondary:
    "bg-white text-[#007AFF] border border-[#C7C7CC] hover:bg-[#F2F2F7] active:bg-[#E5E5EA] shadow-sm",
  ghost:
    "bg-transparent text-[#007AFF] border-transparent hover:bg-[#007AFF]/10 active:bg-[#007AFF]/20",
  danger:
    "bg-[#FF3B30] text-white hover:bg-[#E6352B] active:bg-[#CC2F25] border-transparent shadow-sm",
};

const cupertinoDisabledClasses =
  "disabled:bg-[#F2F2F7] disabled:text-[#C7C7CC] disabled:shadow-none disabled:border-[#E5E5EA] disabled:hover:bg-[#F2F2F7]";

const cupertinoBaseClasses =
  "rounded-xl border transition-all duration-150 font-semibold";

// Cyberpunk: dark panels, neon-coloured borders with glow, monospace uppercase
const cyberpunkVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#ff2d78]/10 text-[#ff2d78] border-[#ff2d78] shadow-[0_0_8px_rgba(255,45,120,0.5)] hover:bg-[#ff2d78]/20 hover:shadow-[0_0_16px_rgba(255,45,120,0.8)] active:bg-[#ff2d78]/30",
  secondary:
    "bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.4)] hover:bg-[#00e5ff]/20 hover:shadow-[0_0_16px_rgba(0,229,255,0.7)] active:bg-[#00e5ff]/30",
  ghost:
    "bg-transparent text-[#00e5ff] border-transparent hover:bg-[#00e5ff]/10 active:bg-[#00e5ff]/20",
  danger:
    "bg-[#ff4444]/10 text-[#ff4444] border-[#ff4444] shadow-[0_0_8px_rgba(255,68,68,0.5)] hover:bg-[#ff4444]/20 hover:shadow-[0_0_16px_rgba(255,68,68,0.8)] active:bg-[#ff4444]/30",
};

const cyberpunkDisabledClasses =
  "disabled:bg-transparent disabled:text-[#4a4a6a] disabled:border-[#4a4a6a] disabled:shadow-none disabled:hover:bg-transparent disabled:hover:shadow-none";

const cyberpunkBaseClasses =
  "rounded-sm border font-mono uppercase tracking-widest text-xs transition-all duration-150";

export const Button: FC<ButtonProps> = ({
  variant = "primary",
  className = "",
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const isNeu = theme === "neumorphism";
  const isMaterial = theme === "material";
  const isCupertino = theme === "cupertino";
  const isCyberpunk = theme === "cyberpunk";

  const themeClasses = isNeu
    ? `${neuBaseClasses} ${neuVariantClasses[variant]} ${neuDisabledClasses}`
    : isMaterial
      ? `${materialBaseClasses} ${materialVariantClasses[variant]} ${materialDisabledClasses}`
      : isCupertino
        ? `${cupertinoBaseClasses} ${cupertinoVariantClasses[variant]} ${cupertinoDisabledClasses}`
        : isCyberpunk
          ? `${cyberpunkBaseClasses} ${cyberpunkVariantClasses[variant]} ${cyberpunkDisabledClasses}`
          : `${glassBaseClasses} ${glassVariantClasses[variant]} ${glassDisabledClasses}`;

  return (
    <button
      className={`px-4 py-2 font-medium cursor-pointer disabled:cursor-not-allowed ${themeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
