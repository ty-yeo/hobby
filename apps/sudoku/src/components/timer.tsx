import { useTheme } from "@core/ui";
import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
} from "react";

export const Timer = forwardRef<
  {
    getTime: () => number;
    pause: () => void;
    resume: () => void;
    reset: () => void;
  },
  { startTime: number }
>(({ startTime = 0 }, ref) => {
  const divRef = useRef<HTMLDivElement>(null);
  const elapsedTimeRef = useRef<number>(startTime);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { theme } = useTheme();
  const isNeu = theme === "neumorphism";
  const isMaterial = theme === "material";
  const isCupertino = theme === "cupertino";
  const isCyberpunk = theme === "cyberpunk";

  const resume = useCallback(() => {
    intervalRef.current = setInterval(() => {
      if (divRef.current) {
        divRef.current.textContent = `${elapsedTimeRef.current.toFixed(2)} seconds`;
      }
      elapsedTimeRef.current += 0.01;
    }, 10);
  }, []);

  useLayoutEffect(() => {
    resume();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTime, resume]);

  useImperativeHandle(
    ref,
    () => ({
      getTime: () => elapsedTimeRef.current,
      pause: () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      },
      resume,
      reset: () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        elapsedTimeRef.current = 0;
        if (divRef.current) divRef.current.textContent = "0.00 seconds";
        resume();
      },
    }),
    [elapsedTimeRef, resume],
  );

  return (
    <div
      ref={divRef}
      className={`text-xl font-mono font-semibold rounded-xl px-4 py-2 ${
        isCyberpunk
          ? "text-[#00e5ff] bg-[#12121f] border border-[#00e5ff]/30 shadow-[0_0_10px_rgba(0,229,255,0.2)] rounded-sm"
          : "text-gray-800"
      } ${
        isNeu
          ? "bg-gray-200 shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)]"
          : isMaterial
            ? "bg-white shadow-md"
            : isCupertino
              ? "bg-white border border-[#E5E5EA] shadow-sm"
              : isCyberpunk
                ? ""
                : "bg-white/30 border border-white/40 backdrop-blur-md shadow-md"
      }`}
    >
      {startTime.toFixed(2)} seconds
    </div>
  );
});
