import { Button, Dialog } from "@core/ui";
import { formatTime } from "../util/highscore";
import type { Level } from "../util/sudoku-generator";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: "primary" | "danger";
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel,
  confirmVariant = "primary",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) => (
  <Dialog open={open} onClose={onCancel} title={title}>
    <div className="flex flex-col gap-3 min-w-56">
      <p>{message}</p>
      <div className="flex gap-2 justify-end">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </div>
  </Dialog>
);

export const RestartDialog = ({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <ConfirmDialog
    open={open}
    title="Restart Game?"
    message="This will clear all the values and memos you've entered. The original given numbers will stay. Are you sure?"
    confirmLabel="Restart"
    confirmVariant="danger"
    onCancel={onCancel}
    onConfirm={onConfirm}
  />
);

export const SaveDialog = ({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <ConfirmDialog
    open={open}
    title="Save Game?"
    message="This will save your current progress and return you to the menu. Continue?"
    confirmLabel="Save"
    onCancel={onCancel}
    onConfirm={onConfirm}
  />
);

export const LeaveDialog = ({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <ConfirmDialog
    open={open}
    title="Leave Game?"
    message="Going back to the menu without saving will discard your current progress. Are you sure?"
    confirmLabel="Leave"
    confirmVariant="danger"
    onCancel={onCancel}
    onConfirm={onConfirm}
  />
);

export const GameOverDialog = ({
  open,
  onDismiss,
  onUndo,
  onRestart,
}: {
  open: boolean;
  onDismiss: () => void;
  onUndo: () => void;
  onRestart: () => void;
}) => (
  <Dialog open={open} onClose={onDismiss} title="Game Over">
    <div className="flex flex-col gap-3 min-w-56">
      <p>The board can no longer be completed with the current values.</p>
      <div className="flex gap-2 justify-end">
        <Button variant="secondary" onClick={onUndo}>Undo</Button>
        <Button variant="danger" onClick={onRestart}>Restart</Button>
      </div>
    </div>
  </Dialog>
);

export const CongratulationsDialog = ({
  open,
  finalTime,
  rank,
  difficulty,
  onBackToMenu,
}: {
  open: boolean;
  finalTime: number | null;
  rank: number | null;
  difficulty: Level;
  onBackToMenu: () => void;
}) => (
  <Dialog open={open} onClose={() => {}} title="🎉 Congratulations!">
    <div className="flex flex-col gap-3 min-w-56">
      <p>You solved the puzzle!</p>
      <p>
        Your time:{" "}
        <span className="font-bold">
          {finalTime !== null ? formatTime(finalTime) : ""}
        </span>
      </p>
      {rank !== null ? (
        <p>
          You ranked <span className="font-bold">#{rank}</span> on the {difficulty} leaderboard!
        </p>
      ) : (
        <p>You didn&apos;t make the top 10 this time — keep practicing!</p>
      )}
      <Button onClick={onBackToMenu}>Back to Menu</Button>
    </div>
  </Dialog>
);
