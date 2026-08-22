import { useTheme } from "../theme/theme-context";

export type TabItem<T extends string> = {
  value: T;
  label: string;
};

export type TabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export const Tabs = <T extends string>({
  items,
  value,
  onChange,
  className = "",
}: TabsProps<T>) => {
  const { theme } = useTheme();
  const isNeu = theme === "neumorphism";
  const isMaterial = theme === "material";
  const isCupertino = theme === "cupertino";
  const isCyberpunk = theme === "cyberpunk";

  const trackClasses = isNeu
    ? "rounded-xl bg-gray-200 p-1 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.15),inset_-4px_-4px_8px_rgba(255,255,255,0.7)]"
    : isMaterial
      ? "rounded-md bg-gray-100 p-1"
      : isCupertino
        ? "rounded-[10px] bg-[#E5E5EA] p-[3px]"
        : isCyberpunk
          ? "rounded-sm bg-[#0d0d1a] border border-[#00e5ff]/30 p-[3px]"
          : "rounded-xl border border-white/40 bg-white/20 p-1 backdrop-blur-md shadow-inner";

  return (
    <div
      role="tablist"
      className={`inline-flex gap-1 ${trackClasses} ${className}`}
    >
      {items.map((item) => {
        const selected = item.value === value;
        const tabClasses = isNeu
          ? selected
            ? "bg-gray-200 text-gray-900 shadow-[3px_3px_6px_rgba(0,0,0,0.2),-3px_-3px_6px_rgba(255,255,255,0.7)]"
            : "bg-transparent text-gray-500 hover:text-gray-700"
          : isMaterial
            ? selected
              ? "bg-white text-blue-700 shadow-md"
              : "bg-transparent text-gray-600 hover:bg-white/60 hover:text-gray-800"
            : isCupertino
              ? selected
                ? "bg-white text-gray-900 shadow-sm"
                : "bg-transparent text-gray-600 hover:text-gray-800"
              : isCyberpunk
                ? selected
                  ? "bg-[#00e5ff]/15 text-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.4)]"
                  : "bg-transparent text-[#4a4a6a] hover:text-[#00e5ff]"
                : selected
                  ? "bg-white/70 text-gray-900 shadow-md backdrop-blur-md"
                  : "bg-transparent text-gray-600 hover:text-gray-800 hover:bg-white/30";
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.value)}
            className={`px-4 py-1.5 rounded-lg font-medium cursor-pointer transition-all duration-200 ${tabClasses}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
