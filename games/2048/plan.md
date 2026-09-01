# 2048 Game Plan

Goal: scaffold `games/2048` as a `@games/2048` workspace package (mirroring
`games/minesweeper`'s structure/conventions) that implements classic 2048 —
slide/merge tiles on a fixed 4×4 grid with arrow keys or swipe, reach the 2048
tile to win. No difficulty levels — one board size for everyone. Consumed by
`apps/game` alongside Minesweeper and Sudoku.

## 1. Package scaffold

- [x] `package.json` (name `@games/2048`, same deps as `@games/minesweeper`:
      `@core/ui`, `@core/utility`, `react`, `react-dom`, `react-router`;
      `exports["."]` pointing at `./src/index.ts`; `lint` script only, no build)
- [x] `tsconfig.json` (extends `../../tsconfig.app.base.json`, `include: ["src"]`)
- [x] `eslint.config.js` (shared `createConfig` factory, same as other `games/*`)
- [x] `src/index.ts` — barrel export `export { Game2048 } from "./game-2048"`
- [x] `src/game-2048.tsx` — `GameLayout title="2048"` wrapping `Routes` for
      `index` (Menu), `game` (Game), `leaderboard` (Leaderboard)
- [x] Confirm npm workspaces picks up `games/2048` automatically (glob `games/*`)
      and `npm install` links it

## 2. Board & merge logic (`src/util/board.ts`)

- [x] `BOARD_SIZE = 4` constant (classic 2048 grid, no difficulty levels)
- [x] `Board = number[][]` (`0` = empty cell)
- [x] `createEmptyBoard()` and `spawnRandomTile(board)` — fills one random
      empty cell with `2` (90%) or `4` (10%); `createInitialBoard()` spawns
      two starting tiles
- [x] `type Direction = "up" | "down" | "left" | "right"`; `move(board, direction)`
      → `{ board: Board; moved: boolean; gained: number }` via per-row/column
      compress → merge-adjacent-equal → compress algorithm (`gained` = sum of
      merged tile values, for scoring)
- [x] `hasAvailableMoves(board)` — true if any empty cell exists or any two
      adjacent cells (row or column) share a value (used for loss detection)
- [x] `hasReachedTarget(board, target = 2048)` — true if any cell `>= target`
- [x] Unit-style sanity checks (manual or lightweight test) for merge edge
      cases: double-merge in one slide (`[2,2,2,2]` → `[4,4]` not `[8]`),
      merge direction correctness for all four directions

## 3. Shared components

- [x] `src/components/timer.tsx` — copy of Minesweeper's `Timer`
      (`getTime`/`pause`/`resume`/`reset` via ref, does not auto-start)
- [x] `src/components/score-counter.tsx` — `ScoreCounter` showing current
      running score (mirrors `MineCounter`'s layout/theming)
- [x] `src/components/tile.tsx` — single tile: value-based background color
      scale (2→2048+), theme-aware styling (neumorphism/material/cupertino/
      cyberpunk, matching `board-cell.tsx` conventions), empty cell when `0`
- [x] `src/components/board.tsx` — CSS-grid `4 × 4` board rendering `Tile`s
      from a `Board`, responsive cell sizing via `ResizeObserver` (same pattern
      as Minesweeper's `board.tsx`)
- [x] `src/components/game-toolbar.tsx` — `GameToolbar` with Back button,
      `Timer`, `ScoreCounter`, Reset button, Save button

## 4. Game state hook (`src/hooks/use-game-state.ts`)

- [x] `GameStatus = "idle" | "playing" | "won" | "lost"`; board stays freshly
      initialized (status `idle`) until the first move, which starts the timer
- [x] A single `handleMove(direction: Direction)` is the one entry point for
      applying a move (apply `move()`, spawn a random tile if `moved`, add
      `gained` to running `score`, then check win/loss) — both keyboard and
      touch input call into it so the two input modes are always in sync,
      never duplicated or drifting behavior
- [x] Keyboard input: `keydown` listener for arrow keys / WASD, calls
      `handleMove`, ignored when `status` is `won`/`lost` or no tiles moved
      (no wasted render/save)
- [x] Touch input: swipe gesture via `touchstart`/`touchend` delta comparison
      (≥ ~30px threshold, picking the dominant axis) mapped to a `Direction`
      and passed to the same `handleMove`, so mobile behaves identically to
      keyboard — same move/merge/scoring/win-loss outcome for an equivalent
      swipe vs. arrow press
- [x] `touchmove` calls `preventDefault()` on the board while a swipe is in
      progress so the page doesn't scroll/bounce during a swipe (mirrors the
      repo's existing mobile-friendly long-press handling in Minesweeper)
- [x] Reaching the 2048 tile → pause timer, `addHighScore(elapsedTime,
finalScore)`, set `finalTime`/`rank`, status `won`
- [x] No available moves after a spawn → pause timer, `addHighScore(elapsedTime,
finalScore)`, set `finalTime`/`rank`, status `lost` (a lost game still
      submits its score to the leaderboard, not just a win)
- [x] Reset regenerates a fresh board (status → `idle`, score → 0, timer → 0)
- [x] Save writes `{ board, score, elapsedTime }` as plain JSON to
      `localStorage` (no XOR obfuscation needed — unlike Minesweeper, there's no
      hidden info to protect from the player)
- [x] `isNew=false` (Load Game) reads the saved state and resumes the timer if
      the loaded status is `playing`

## 5. Pages

- [x] `src/pages/menu.tsx` — "New Game" navigates straight to
      `/game?isNew=true` (no dialog); "Load Game" and "Leaderboard" buttons
      mirror Minesweeper's menu
- [x] `src/pages/game.tsx` — renders `GameToolbar` then `Board`, plus a
      won/lost status line (won: final time + rank; lost: final score)
- [x] `src/pages/leaderboard.tsx` — mirrors Minesweeper's leaderboard minus the
      difficulty `Tabs`: a single ranked list showing rank, score, time, and
      date, sourced from `getHighScores()`

## 6. High scores (`src/util/highscore.ts`)

- [x] Self-contained store (not `createHighScoreStore` from `@core/utility` —
      superseded in section 9 once ranking needed to be score-first instead of
      time-only, which that shared store doesn't support)

## 7. Wiring into `apps/game`

- [x] Add `@games/2048` as a dependency of `apps/game/package.json`
- [x] `apps/game/src/pages/game-page.tsx` — add `Game2048Page` (Back button +
      `Game2048`), mirroring `MinesweeperPage`/`SudokuPage`
- [x] `apps/game/src/main.tsx` — add route `{ path: "2048/*", Component:
Game2048Page }`
- [x] `apps/game/src/config/games.ts` — add `{ id: "2048", title: "2048",
thumbnail: "/thumbnails/2048.svg" }` entry
- [x] `apps/game/public/thumbnails/2048.svg` — new thumbnail icon

## 8. Verification

- [x] `turbo run lint build --filter=@games/2048` (and `--filter=@app/game`)
      passes cleanly
- [x] Verified in-browser: arrow keys/swipe slide and merge tiles correctly on
      all four directions, score updates on merges, reaching 2048 shows the win
      message with time + rank, a full unmergeable board shows the loss
      message, Reset clears the board/score/timer, Save + Load Game round-trips
      state correctly, and the leaderboard renders seeded scores per difficulty
- [x] Verified on a touch device / mobile emulation: swiping in each of the
      four directions produces the exact same move/merge/score/win-loss result
      as the equivalent arrow key on desktop, swiping doesn't scroll or bounce
      the page, and small/ambiguous swipes below the threshold are ignored
      rather than misfiring a random direction

## 9. Score-based leaderboard ranking (follow-up)

Goal: rank the leaderboard by score first (higher is better), with elapsed
time as the tiebreaker (lower is better) when two entries have the same
score. A leaderboard entry is now recorded whenever the game ends, whether by
winning (reaching 2048) or losing (no more moves), not just on a win.

- [x] `src/util/highscore.ts` rewritten as a self-contained store (dropped
      `createHighScoreStore` from `@core/utility`, since that store's ranking
      is hardcoded ascending-by-time only and doesn't fit a score-first rule):
      `HighScoreEntry = { time, score, date }`, `compareEntries` sorts by
      `score` descending then `time` ascending, top 10 kept
- [x] `getHighScores()` also sorts on read (not just on write in
      `addHighScore`) so the displayed order is correct even if storage was
      populated any other way
- [x] `addHighScore(time, score)` signature takes both values and returns
      `{ scores, rank }` computed from the new comparator
- [x] `use-game-state.ts`: `handleMove` computes the post-move score
      synchronously (`const newScore = score + gained`) instead of a
      functional `setScore` update, so the exact final score is available to
      pass into `finishWin`/`finishLose` in the same call
- [x] `finishWin(finalScore)` and `finishLose(finalScore)` both call
      `addHighScore(elapsedTime, finalScore)` and store the returned `rank` —
      losing now also submits a leaderboard entry, matching "when the game
      ends" rather than only on a win
- [x] `pages/game.tsx` win message includes the final score; loss message now
      also shows `rank` when the score made the top 10
- [x] `pages/leaderboard.tsx` row layout updated to show rank, score, time,
      and date (score is the primary sorted column now, not time)
- [x] `turbo run lint build --filter=@games/2048 --filter=@app/game` passes
- [x] Verified in-browser: seeded four scores with a tie (same score,
      different times) and confirmed sort order is score descending with the
      faster time ranked above the slower one on a tie; played a real game to
      a win and confirmed the win message shows score + time + rank and the
      entry appears correctly ranked on the leaderboard

## 10. Slide/merge animation with input locking (follow-up)

Goal: tiles visually slide (and merge) into their new position over 0.2s
instead of snapping instantly, and player input (keyboard/swipe) is ignored
for the duration of that transition so a rapid second move can't interrupt
or race the first one.

- [x] `src/util/board.ts` rewritten from a plain `number[][]` grid to an
      identity-based model — `Tile = { id, row, col, value }` — since
      animating a _position change_ requires a stable key React can track
      across renders; a value-only grid has no concept of "this cell's tile
      moved from A to B"
- [x] `move(tiles, direction)` now returns tiles with updated `row`/`col`
      (preserving `id`, including through merges — the surviving tile keeps
      the leading tile's `id`) instead of a fresh value grid
- [x] `hasAvailableMoves`/`hasReachedTarget` reimplemented against `Tile[]`
      (deriving a scratch grid internally where still convenient)
- [x] `src/components/tile.tsx` — `Tile` now takes `row`, `col`, `step`,
      `cellSize` and renders absolutely-positioned with
      `transform: translate(col*step, row*step)` and
      `transition-transform duration-200`; exports `TILE_ANIMATION_MS = 200`
      so the hook's input-lock timer can never drift out of sync with the
      CSS duration
- [x] `src/components/board.tsx` — split into a static backdrop grid (empty
      cell slots, CSS grid, never re-rendered per move) plus an absolutely
      positioned tiles layer on top, so only the tiles layer re-renders/
      animates on each move; sizing math updated to keep both layers pixel-
      aligned
- [x] `src/hooks/use-game-state.ts` — new `isAnimating` state; `handleMove`
      early-returns while `isAnimating` (in addition to the existing
      won/lost guard), and starts a `TILE_ANIMATION_MS` timeout after every
      accepted move to clear it; the timeout is cleared/reset on Reset and
      on unmount so it can never fire after the game state has moved on
- [x] `SavedGameState`/localStorage save-load updated to persist `tiles`
      instead of `board`
- [x] `turbo run lint build --filter=@games/2048 --filter=@app/game` passes
      cleanly
- [x] Verified in-browser: confirmed the tile's `transition-duration` is
      `0.2s` and its `transform` reflects the new grid position; fired a
      merge move then immediately fired three more key presses within the
      200ms window and confirmed none of them registered (score/tile count
      unchanged mid-animation); confirmed a move fired after the window
      closes registers normally
