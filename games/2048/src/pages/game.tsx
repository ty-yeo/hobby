import { useRef } from "react";
import { Board } from "../components/board";
import { GameToolbar } from "../components/game-toolbar";
import type { TimerHandle } from "../components/timer";
import { useGameState } from "../hooks/use-game-state";
import { formatTime } from "../util/highscore";

export const Game = () => {
  const timerRef = useRef<TimerHandle | null>(null);
  const {
    isLoading,
    tiles,
    score,
    status,
    finalTime,
    rank,
    startTime,
    handleReset,
    handleSave,
    handleBack,
  } = useGameState(timerRef);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <GameToolbar
        timerRef={timerRef}
        startTime={startTime}
        score={score}
        onBack={handleBack}
        onReset={handleReset}
        onSave={handleSave}
      />

      <Board tiles={tiles} />

      {status === "won" && (
        <p className="font-semibold text-green-700">
          🎉 You reached 2048 with a score of {score} in{" "}
          {formatTime(finalTime ?? 0)}
          {rank !== null ? ` — ranked #${rank}!` : "!"}
        </p>
      )}
      {status === "lost" && (
        <p className="font-semibold text-red-700">
          💥 No more moves. Final score: {score}
          {rank !== null ? ` — ranked #${rank}!` : "."}
        </p>
      )}
    </div>
  );
};
