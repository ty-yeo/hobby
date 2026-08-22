import { Button } from "@core/ui";
import type { RefObject } from "react";
import type { GameStatus, TimerHandle } from "../hooks/use-game-state";
import { Timer } from "./timer";

type GameToolbarProps = {
  timerRef: RefObject<TimerHandle | null>;
  startTime: number;
  status: GameStatus;
  canUndo: boolean;
  canRedo: boolean;
  onBack: () => void;
  onTogglePause: () => void;
  onRestartClick: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
};

const UndoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </svg>
);

const RedoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 14 5-5-5-5" />
    <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
  </svg>
);

export const GameToolbar = ({
  timerRef,
  startTime,
  status,
  canUndo,
  canRedo,
  onBack,
  onTogglePause,
  onRestartClick,
  onUndo,
  onRedo,
  onSave,
}: GameToolbarProps) => (
  <div className="flex justify-evenly items-center">
    <Timer ref={timerRef} startTime={startTime} />
    <div className="flex gap-2 items-center">
      <Button variant="secondary" onClick={onBack}>← Back</Button>
      <Button variant="secondary" onClick={onTogglePause}>
        {status === "playing" ? "Pause" : "Resume"}
      </Button>
      <Button variant="danger" onClick={onRestartClick} disabled={status !== "playing"}>
        Restart
      </Button>
      <Button variant="secondary" aria-label="Undo" title="Undo" onClick={onUndo} disabled={status !== "playing" || !canUndo}>
        <UndoIcon />
      </Button>
      <Button variant="secondary" aria-label="Redo" title="Redo" onClick={onRedo} disabled={status !== "playing" || !canRedo}>
        <RedoIcon />
      </Button>
      <Button variant="secondary" onClick={onSave}>Save</Button>
    </div>
  </div>
);
