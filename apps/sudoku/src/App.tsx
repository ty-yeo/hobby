import { Center, useTheme } from "@core/ui";
import { Outlet } from "react-router";

export const App = () => {
  const { theme } = useTheme();
  const isNeu = theme === "neumorphism";
  const isMaterial = theme === "material";
  const isCupertino = theme === "cupertino";
  const isCyberpunk = theme === "cyberpunk";

  return (
    <main
      className={`flex h-screen w-screen flex-col items-center justify-between relative overflow-hidden ${
        isNeu
          ? "bg-gray-200"
          : isMaterial
            ? "bg-gray-50"
            : isCupertino
              ? "bg-[#F2F2F7]"
              : isCyberpunk
                ? "bg-[#0d0d1a]"
                : "bg-linear-to-br from-indigo-300 via-sky-200 to-pink-300"
      }`}
    >
      {!isNeu && !isMaterial && !isCupertino && !isCyberpunk && (
        <>
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-400/40 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-sky-400/40 blur-3xl pointer-events-none" />
        </>
      )}
      {isCyberpunk && (
        <>
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#ff2d78]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#00e5ff]/10 blur-3xl pointer-events-none" />
        </>
      )}
      <Center className="flex flex-col gap-4">
        <div
          className={
            isNeu
              ? "flex flex-col items-center gap-4 rounded-3xl bg-gray-200 p-8 shadow-[12px_12px_24px_rgba(0,0,0,0.2),-12px_-12px_24px_rgba(255,255,255,0.7)]"
              : isMaterial
                ? "flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-xl"
                : isCupertino
                  ? "flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-sm border border-[#E5E5EA]"
                  : isCyberpunk
                    ? "flex flex-col items-center gap-4 rounded-sm bg-[#12121f] p-8 border border-[#00e5ff]/30 shadow-[0_0_40px_rgba(0,229,255,0.1)]"
                    : "flex flex-col items-center gap-4 rounded-3xl border border-white/40 bg-white/25 p-8 shadow-2xl backdrop-blur-2xl"
          }
        >
          <h1
            className={`text-4xl font-bold drop-shadow-sm ${isCyberpunk ? "text-[#ff2d78] font-mono tracking-wider [text-shadow:0_0_20px_rgba(255,45,120,0.6)]" : "text-gray-800"}`}
          >
            Sudoku
          </h1>
          <Outlet />
        </div>
      </Center>
    </main>
  );
};
