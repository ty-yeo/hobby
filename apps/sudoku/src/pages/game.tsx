import { Button } from "@core/ui";
import { useRef } from "react";
import { useNavigate } from "react-router";
import { Board } from "../components/board";
import {
    CongratulationsDialog,
    GameOverDialog,
    LeaveDialog,
    RestartDialog,
    SaveDialog,
} from "../components/game-dialogs";
import { GameToolbar } from "../components/game-toolbar";
import { NumberHintBar } from "../components/number-hint-bar";
import { useGameState, type TimerHandle } from "../hooks/use-game-state";

export const Game = () => {
  const navigate = useNavigate();
  const timerRef = useRef<TimerHandle | null>(null);
  const {
    isLoading,
    status,
    setStatus,
    gameState,
    selected,
    setSelected,
    hoveredNumber,
    setHoveredNumber,
    hintModeNumber,
    setHintModeNumber,
    difficulty,
    hintCoins,
    finalTime,
    rank,
    showRestartDialog,
    setShowRestartDialog,
    showSaveDialog,
    setShowSaveDialog,
    showBackDialog,
    setShowBackDialog,
    showGameOverDialog,
    setShowGameOverDialog,
    invalidCells,
    canUndo,
    canRedo,
    startTime,
    boardContainerRef,
    handleCellChange,
    handleUndo,
    handleRedo,
    handleRestart,
    handleSaveConfirm,
    handleBackConfirm,
    handleHint,
  } = useGameState(timerRef);

  if (isLoading) return <div>Loading...</div>;

  const boardStatus =
    showRestartDialog || showBackDialog || showGameOverDialog
      ? "paused"
      : status === "completed"
        ? "playing"
        : status;

  return (
    <div className="min-w-3xl">
      <GameToolbar
        timerRef={timerRef}
        startTime={startTime}
        status={status}
        canUndo={canUndo}
        canRedo={canRedo}
        onBack={() => {
          timerRef.current?.pause();
          setShowBackDialog(true);
        }}
        onTogglePause={() => {
          if (status === "playing") {
            timerRef.current?.pause();
            setStatus("paused");
          } else if (status === "paused") {
            timerRef.current?.resume();
            setStatus("playing");
          }
        }}
        onRestartClick={() => {
          timerRef.current?.pause();
          setShowRestartDialog(true);
        }}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={() => {
          timerRef.current?.pause();
          setStatus("paused");
          setShowSaveDialog(true);
        }}
      />

      <div
        className="flex justify-center items-center mt-4"
        ref={boardContainerRef}
      >
        <Board
          board={gameState.board}
          memo={gameState.memo}
          given={gameState.given}
          invalidCells={invalidCells}
          status={boardStatus}
          hoveredNumber={hoveredNumber}
          hintNumber={hintModeNumber}
          selected={selected}
          onSelectCell={(row, col) => setSelected({ row, col })}
          onCellChange={handleCellChange}
        />
      </div>

      <div
        className={`flex flex-col items-center gap-2 ${boardStatus !== "playing" ? "invisible" : ""}`}
      >
        <NumberHintBar
          board={gameState.board}
          activeNumber={hintModeNumber}
          onHover={setHoveredNumber}
          onClickNumber={(num) =>
            setHintModeNumber((prev) => (prev === num ? null : num))
          }
        />
        <Button
          variant="secondary"
          onClick={handleHint}
          disabled={status !== "playing" || hintCoins <= 0}
        >
          💡 Hint ({hintCoins})
        </Button>
      </div>

      <RestartDialog
        open={showRestartDialog}
        onCancel={() => {
          setShowRestartDialog(false);
          timerRef.current?.resume();
        }}
        onConfirm={handleRestart}
      />
      <SaveDialog
        open={showSaveDialog}
        onCancel={() => {
          setShowSaveDialog(false);
          timerRef.current?.resume();
          setStatus("playing");
        }}
        onConfirm={handleSaveConfirm}
      />
      <LeaveDialog
        open={showBackDialog}
        onCancel={() => {
          setShowBackDialog(false);
          timerRef.current?.resume();
        }}
        onConfirm={handleBackConfirm}
      />
      <GameOverDialog
        open={showGameOverDialog}
        onDismiss={() => {
          setShowGameOverDialog(false);
          timerRef.current?.resume();
        }}
        onUndo={() => {
          setShowGameOverDialog(false);
          handleUndo();
          timerRef.current?.resume();
        }}
        onRestart={handleRestart}
      />
      <CongratulationsDialog
        open={status === "completed"}
        finalTime={finalTime}
        rank={rank}
        difficulty={difficulty}
        onBackToMenu={() => navigate("/")}
      />
    </div>
  );
};
