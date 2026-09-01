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
import {
  MERGE_ANIMATION_MS,
  SPAWN_ANIMATION_MS,
  TILE_ANIMATION_MS,
} from "../components/tile";
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
// Merge and spawn run concurrently, so the combined step only takes as long
// as the longer of the two — not their sum.
const SETTLE_MS = Math.max(MERGE_ANIMATION_MS, SPAWN_ANIMATION_MS);

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
  // Blocks new moves while either animation step (slide, then merge+spawn
  // together — see `handleMove`) is still playing.
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
  //
  // Animation is split into two sequential steps:
  //   1. Slide — tiles move toward the input direction; a merging pair both
  //      land on the same cell, still unmerged (two overlapping tiles).
  //   2. Merge + spawn — once the slide settles, overlapping pairs collapse
  //      into one doubled tile *and* a new tile appears at the same time
  //      (they're independent visual changes, so no need to sequence them).
  const handleMove = useCallback(
    (direction: Direction) => {
      if (status === "won" || status === "lost" || isAnimating) return;

      const {
        tiles: mergedTiles,
        slid,
        moved,
        gained,
      } = move(tiles, direction);
      if (!moved) return;

      const newScore = score + gained;

      // Step 1: render the slide result — pairs about to merge still overlap
      // as two distinct (unmerged) tiles.
      setTiles(slid);
      setScore(newScore);
      setIsAnimating(true);

      if (status === "idle") {
        setStatus("playing");
        timerRef.current?.resume();
      }

      clearAnimationTimeout();
      animationTimeoutRef.current = setTimeout(() => {
        // Step 2: the slide has settled — merge and spawn simultaneously.
        const spawned = spawnRandomTile(mergedTiles);
        setTiles(spawned);

        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false);
          animationTimeoutRef.current = null;

          if (hasReachedTarget(spawned)) {
            finishWin(newScore);
          } else if (!hasAvailableMoves(spawned)) {
            finishLose(newScore);
          }
        }, SETTLE_MS);
      }, TILE_ANIMATION_MS);
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
