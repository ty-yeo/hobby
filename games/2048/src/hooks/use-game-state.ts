/* eslint-disable react-hooks/refs */
/* eslint-disable react-hooks/set-state-in-effect */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router";
import { TILE_ANIMATION_MS } from "../components/tile";
import {
  createInitialTiles,
  hasAvailableMoves,
  hasReachedTarget,
  move,
  spawnRandomTile,
  type Direction,
  type Tile,
} from "../util/board";
import { addHighScore } from "../util/highscore";

export type GameStatus = "idle" | "playing" | "won" | "lost";

export type TimerHandle = {
  getTime: () => number;
  pause: () => void;
  resume: () => void;
  reset: () => void;
};

type SavedGameState = {
  tiles: Tile[];
  score: number;
  status: GameStatus;
  elapsedTime: number;
};

const STORAGE_KEY = "2048GameState";
const SWIPE_THRESHOLD = 30;

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  a: "left",
  s: "down",
  d: "right",
  W: "up",
  A: "left",
  S: "down",
  D: "right",
};

export const useGameState = (timerRef: React.RefObject<TimerHandle | null>) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [tiles, setTiles] = useState<Tile[]>(() => createInitialTiles());
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  // Blocks new moves while the 0.2s slide/merge transition is still playing.
  const [isAnimating, setIsAnimating] = useState(false);

  const startTimeRef = useRef(0);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isNew = searchParams.get("isNew") ?? "true";

  const clearAnimationTimeout = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  };

  useLayoutEffect(() => {
    if (isNew === "true") {
      setTiles(createInitialTiles());
      setScore(0);
      setStatus("idle");
      setFinalTime(null);
      setRank(null);
      startTimeRef.current = 0;
    } else {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? (JSON.parse(raw) as SavedGameState) : null;
      if (saved) {
        setTiles(saved.tiles);
        setScore(saved.score);
        setStatus(saved.status);
        startTimeRef.current = saved.elapsedTime;
      } else {
        setTiles(createInitialTiles());
        setScore(0);
        setStatus("idle");
      }
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resume the timer for a game that was saved mid-play.
  useEffect(() => {
    if (!isLoading && status === "playing") {
      timerRef.current?.resume();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // Cancel any pending animation-unlock timeout on unmount.
  useEffect(() => clearAnimationTimeout, []);

  const finishWin = useCallback(
    (finalScore: number) => {
      timerRef.current?.pause();
      const elapsedTime = timerRef.current?.getTime() ?? 0;
      const { rank: earnedRank } = addHighScore(elapsedTime, finalScore);
      setFinalTime(elapsedTime);
      setRank(earnedRank);
      setStatus("won");
      localStorage.removeItem(STORAGE_KEY);
    },
    [timerRef],
  );

  const finishLose = useCallback(
    (finalScore: number) => {
      timerRef.current?.pause();
      const elapsedTime = timerRef.current?.getTime() ?? 0;
      const { rank: earnedRank } = addHighScore(elapsedTime, finalScore);
      setFinalTime(elapsedTime);
      setRank(earnedRank);
      setStatus("lost");
      localStorage.removeItem(STORAGE_KEY);
    },
    [timerRef],
  );

  // The one entry point for applying a move — keyboard and touch input both
  // funnel through this so the two input modes can never behave differently.
  const handleMove = useCallback(
    (direction: Direction) => {
      if (status === "won" || status === "lost" || isAnimating) return;

      const { tiles: movedTiles, moved, gained } = move(tiles, direction);
      if (!moved) return;

      const spawned = spawnRandomTile(movedTiles);
      const newScore = score + gained;
      setTiles(spawned);
      setScore(newScore);

      // Block further input until the slide/merge transition finishes.
      setIsAnimating(true);
      clearAnimationTimeout();
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        animationTimeoutRef.current = null;
      }, TILE_ANIMATION_MS);

      if (status === "idle") {
        setStatus("playing");
        timerRef.current?.resume();
      }

      if (hasReachedTarget(spawned)) {
        finishWin(newScore);
      } else if (!hasAvailableMoves(spawned)) {
        finishLose(newScore);
      }
    },
    [tiles, score, status, isAnimating, timerRef, finishWin, finishLose],
  );

  // Keyboard input: arrow keys / WASD.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const direction = KEY_DIRECTIONS[e.key];
      if (!direction) return;
      e.preventDefault();
      handleMove(direction);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleMove]);

  // Touch input: swipe gesture, mapped to the same `handleMove` as keyboard
  // so mobile behaves identically to desktop.
  useEffect(() => {
    const touchStart = { current: null as { x: number; y: number } | null };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStart.current = { x: t.clientX, y: t.clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      // prevent page scroll/bounce while a swipe is in progress
      if (touchStart.current) e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      const start = touchStart.current;
      touchStart.current = null;
      if (!start) return;

      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) return;

      const direction: Direction =
        absDx > absDy ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
      handleMove(direction);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [handleMove]);

  const handleReset = () => {
    clearAnimationTimeout();
    setIsAnimating(false);
    setTiles(createInitialTiles());
    setScore(0);
    setStatus("idle");
    setFinalTime(null);
    setRank(null);
    localStorage.removeItem(STORAGE_KEY);
    timerRef.current?.reset();
  };

  const handleSave = () => {
    const elapsedTime = timerRef.current?.getTime() ?? 0;
    const payload: SavedGameState = { tiles, score, status, elapsedTime };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const handleBack = () => navigate("..");

  return {
    isLoading,
    tiles,
    score,
    status,
    finalTime,
    rank,
    startTime: startTimeRef.current,
    handleReset,
    handleSave,
    handleBack,
  };
};
