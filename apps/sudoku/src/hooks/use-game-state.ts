/* eslint-disable react-hooks/refs */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { addHighScore } from "../util/highscore";
import { generateSudoku, type Level } from "../util/sudoku-generator";
import {
    computeInvalidCells,
    isBoardComplete,
    isBoardSolvable,
} from "../util/sudoku-validation";

export type GameStatus = "playing" | "paused" | "completed";

export type GameStateData = {
  board: number[][];
  solution: number[][];
  given: boolean[][];
  memo: string[][][];
};

export type TimerHandle = {
  getTime: () => number;
  pause: () => void;
  resume: () => void;
  reset: () => void;
};

type CellSnapshot = { row: number; col: number; value: number; memo: string[] };
type HistoryAction = { before: CellSnapshot; after: CellSnapshot };

const HINT_COINS: Record<Level, number> = { easy: 3, medium: 2, hard: 1 };
const MAX_HISTORY = 40;

const emptyMemo = (): string[][][] =>
  Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []));

const INITIAL_STATE: GameStateData = {
  board: [[]],
  solution: [[]],
  given: [[]],
  memo: [[[]]],
};

export const useGameState = (timerRef: React.RefObject<TimerHandle | null>) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [gameState, setGameState] = useState<GameStateData>(INITIAL_STATE);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [hoveredNumber, setHoveredNumber] = useState<number | null>(null);
  const [hintModeNumber, setHintModeNumber] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Level>(
    () => (searchParams.get("difficulty") as Level) ?? "medium",
  );
  const [hintCoins, setHintCoins] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showBackDialog, setShowBackDialog] = useState(false);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);

  const isNew = searchParams.get("isNew") ?? true;
  const startTimeRef = useRef<number>(0);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const undoStackRef = useRef<HistoryAction[]>([]);
  const redoStackRef = useRef<HistoryAction[]>([]);
  const hasCompletedRef = useRef(false);

  const canUndo = historyVersion >= 0 && undoStackRef.current.length > 0;
  const canRedo = historyVersion >= 0 && redoStackRef.current.length > 0;
  const invalidCells = useMemo(
    () => computeInvalidCells(gameState.board, gameState.given),
    [gameState.board, gameState.given],
  );

  useLayoutEffect(() => {
    const initNew = (level: Level) => {
      const generated = generateSudoku(level);
      startTimeRef.current = 0;
      setGameState({
        board: generated.board,
        solution: generated.solution,
        given: generated.given,
        memo: emptyMemo(),
      });
      setHintCoins(HINT_COINS[level]);
    };

    switch (isNew) {
      case "true": {
        initNew((searchParams.get("difficulty") as Level) ?? "medium");
        break;
      }
      case "false": {
        const raw = localStorage.getItem("sudokuGameState");
        if (raw) {
          const saved = JSON.parse(raw);
          const level: Level = saved.difficulty ?? "medium";
          setDifficulty(level);
          setGameState({
            board: saved.board,
            solution: saved.solution,
            given: saved.given,
            memo: saved.memo,
          });
          setHintCoins(saved.hintCoins ?? HINT_COINS[level]);
          startTimeRef.current = saved.startTime ?? 0;
        } else {
          initNew("medium");
          setDifficulty("medium");
        }
        break;
      }
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCellChange = (
    row: number,
    col: number,
    newValue: number,
    newMemo?: string[],
    skipHistory = false,
  ) => {
    if (gameState.given[row]?.[col]) return;

    setGameState((prev) => {
      const prevValue = prev.board[row][col];
      const prevMemo = prev.memo[row][col];
      const resolvedMemo = newMemo ?? prevMemo;

      const newBoard = prev.board.map((r, ri) =>
        r.map((c, ci) => (ri === row && ci === col ? newValue : c)),
      );
      const newMemoGrid = prev.memo.map((r, ri) =>
        r.map((m, ci) => (ri === row && ci === col ? resolvedMemo : m)),
      );

      if (!skipHistory) {
        undoStackRef.current.push({
          before: { row, col, value: prevValue, memo: prevMemo },
          after: { row, col, value: newValue, memo: resolvedMemo },
        });
        if (undoStackRef.current.length > MAX_HISTORY) undoStackRef.current.shift();
        redoStackRef.current = [];
        setHistoryVersion((v) => v + 1);
      }

      if (!hasCompletedRef.current && isBoardComplete(newBoard)) {
        hasCompletedRef.current = true;
        timerRef.current?.pause();
        const time = timerRef.current?.getTime() ?? 0;
        const { rank: earnedRank } = addHighScore(difficulty, time);
        setFinalTime(time);
        setRank(earnedRank);
        setStatus("completed");
        localStorage.removeItem("sudokuGameState");
      } else if (newValue !== 0 && !hasCompletedRef.current) {
        const newInvalid = computeInvalidCells(newBoard, prev.given);
        if (newInvalid.some((r) => r.some((v) => v)) || !isBoardSolvable(newBoard)) {
          timerRef.current?.pause();
          setShowGameOverDialog(true);
        }
      }

      return { ...prev, board: newBoard, memo: newMemoGrid };
    });
  };

  const handleUndo = () => {
    const action = undoStackRef.current.pop();
    if (!action) return;
    redoStackRef.current.push(action);
    handleCellChange(action.before.row, action.before.col, action.before.value, action.before.memo, true);
    setHistoryVersion((v) => v + 1);
  };

  const handleRedo = () => {
    const action = redoStackRef.current.pop();
    if (!action) return;
    undoStackRef.current.push(action);
    handleCellChange(action.after.row, action.after.col, action.after.value, action.after.memo, true);
    setHistoryVersion((v) => v + 1);
  };

  const handleRestart = () => {
    setGameState((prev) => ({
      ...prev,
      board: prev.given.map((row, ri) =>
        row.map((isGiven, ci) => (isGiven ? prev.board[ri][ci] : 0)),
      ),
      memo: emptyMemo(),
    }));
    undoStackRef.current = [];
    redoStackRef.current = [];
    hasCompletedRef.current = false;
    setSelected(null);
    setHistoryVersion((v) => v + 1);
    setStatus("playing");
    setShowRestartDialog(false);
    setShowGameOverDialog(false);
    timerRef.current?.reset();
  };

  const handleSaveConfirm = () => {
    const currentTime = timerRef.current?.getTime();
    if (currentTime !== undefined) {
      localStorage.setItem(
        "sudokuGameState",
        JSON.stringify({ startTime: currentTime, difficulty, hintCoins, ...gameState }),
      );
    }
    setShowSaveDialog(false);
    navigate("/");
  };

  const handleBackConfirm = () => {
    setShowBackDialog(false);
    navigate("/");
  };

  const handleHint = () => {
    if (hintCoins <= 0 || status !== "playing") return;
    const empty: { row: number; col: number }[] = [];
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (gameState.board[r][c] === 0) empty.push({ row: r, col: c });
    if (empty.length === 0) return;
    const { row, col } = empty[Math.floor(Math.random() * empty.length)];
    setHintCoins((prev) => prev - 1);
    handleCellChange(row, col, gameState.solution[row][col], []);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!selected || status !== "playing") return;
      const { row, col } = selected;
      if (gameState.given[row]?.[col]) return;
      if (e.key === "Backspace" || e.key === "Delete") {
        handleCellChange(row, col, 0, []);
      } else if (/^[1-9]$/.test(e.key)) {
        handleCellChange(row, col, parseInt(e.key, 10));
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, status, gameState]);

  useEffect(() => {
    if (!hintModeNumber) return;
    const onOutsideClick = (e: MouseEvent) => {
      if (boardContainerRef.current && !boardContainerRef.current.contains(e.target as Node)) {
        setHintModeNumber(null);
      }
    };
    document.addEventListener("click", onOutsideClick, true);
    return () => document.removeEventListener("click", onOutsideClick, true);
  }, [hintModeNumber]);

  return {
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
    startTime: startTimeRef.current,
    boardContainerRef,
    handleCellChange,
    handleUndo,
    handleRedo,
    handleRestart,
    handleSaveConfirm,
    handleBackConfirm,
    handleHint,
  };
};
