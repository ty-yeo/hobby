# Sudoku Feature Plan

## Shared / Reusable (core/ui)

- [x] Add `Button` component to `core/ui` (basic reusable styled button)
- [x] Add `Dialog` (modal) component to `core/ui` (reusable overlay dialog with backdrop, close on backdrop click)
- [x] Export new components from `core/ui/src/components/index.tsx`

## Sudoku Generator

- [x] Update `sudoku-generator.ts` to also return the full `solution` board and a `given` mask (boolean[][]) marking pre-filled cells
- [x] Keep difficulty levels (easy/medium/hard)

## Board / Cell (app-specific)

- [x] Track `given` cells; given cells are rendered read-only (not editable, no memo, distinct styling) — "don't let user fix what is given"
- [x] Render memo numbers inside empty cells as a 3x3 mini-grid of small digits
- [x] Support "erase" - clear value & memo of the selected (non-given) cell
- [x] Support selecting a cell (for erase / keyboard entry)
- [x] Highlight prop: given a hovered number, highlight (light sky blue) all cells in the row/column/box of every existing occurrence of that number (cells where that number cannot be placed)
- [x] Prevent editing given cells entirely (no input, no memo popup, no highlight-as-selected)

## Hint Bar

- [x] New `NumberHintBar` component: horizontal list of 1-9 buttons under the board
- [x] On hover of a number, notify board to compute/apply "can't place" highlight in light sky blue
- [x] Clear highlight on mouse leave

## Erase Feature

- [x] Add "Erase" button in game UI (or keyboard Delete/Backspace) to clear selected non-given cell's value + memo

## Difficulty Selection Dialog

- [x] New `DifficultyDialog` component (uses core/ui `Dialog` + `Button`)
- [x] Menu "New Game" button opens dialog instead of navigating directly
- [x] Dialog offers Easy / Medium / Hard; selecting navigates to `/game?isNew=true&difficulty=<level>`
- [x] Game page reads `difficulty` from query params and generates puzzle accordingly

## High Score Feature

- [x] `util/highscore.ts`: read/write high scores to localStorage, keyed per difficulty
- [x] Sorted ascending by time (fastest = rank #1), capped to top N (e.g. 10)
- [x] On board completion (filled board matches solution), stop timer, record score, show completion state
- [x] New `Leaderboard` page listing high scores grouped/tabbed by difficulty
- [x] Menu "Leaderboard" button navigates to leaderboard page
- [x] Add leaderboard route in `main.tsx`

## Game Page Wiring

- [x] Update `Game` page: pass `given`, `solution`, selected cell, erase handler, hint hover state to `Board`
- [x] Detect win condition, pause timer, persist high score, show a completion dialog with result + link back to menu
- [x] Persist `given` + `solution` in saved game state (localStorage) for "Load Game" continuation

## Routing

- [x] Add `/leaderboard` route
- [x] Ensure query params (`isNew`, `difficulty`) flow correctly

## Polish

- [x] Verify no TypeScript/lint errors across changed files

## Hint Coins Feature

- [x] Determine coin count per difficulty (easy: 3, medium: 2, hard: 1) and initialize on new game start (persist in saved game state for Load Game)
- [x] Add "Hint" button next to `NumberHintBar` showing remaining coin count, disabled when 0 remain or game not playing
- [x] Clicking Hint reveals one random cell that currently has no value (empty, non-given) by setting it to the solution value and clearing its memo
- [x] Decrement remaining coins on each hint use
- [x] Persist hint coins in `sudokuGameState` localStorage save/load

## Hint Bar Number Graying

- [x] In `NumberHintBar`, compute per-number completion (all 9 placed on board) and gray out / disable hover highlight for completed numbers

## Board Block Dividers

- [x] Add visual divider lines between each 3x3 box in `Board` (thicker, centered, light gray, single continuous lines using a dedicated CSS Grid divider track)

## Hint Mode Feature

- [x] `NumberHintBar`: clicking a number toggles "hint mode" for that number (visually indicated as active); clicking again or clicking outside the board exits hint mode
- [x] While in hint mode, the row/column/box highlight for that number stays displayed regardless of hover
- [x] `Board`/`BoardCell`: left-click on an empty, non-given cell while in hint mode fills it with the hint-mode number
- [x] `Board`/`BoardCell`: right-click on an empty, non-given cell while in hint mode toggles a memo of that number instead of opening the memo popup
- [x] Clicking outside the board container exits hint mode (document click-outside listener)

## Win Detection Fix

- [x] Fixed win detection: previously compared filled board to the exact generated `solution` array, which failed for alternate valid solutions; now validates the board is full and satisfies Sudoku rules (no duplicates in any row/column/box)
- [x] Guarded against duplicate completion triggers (e.g. rapid updates) with a `hasCompletedRef`
- [x] Completion `Dialog` now shows a clear congratulations message, final time, and the player's rank on the difficulty's leaderboard

## Dialog Z-Index Fix

- [x] Fixed `core/ui` `Dialog` rendering behind/through board cell content: switched to a React Portal (`createPortal` into `document.body`) so the overlay always escapes any ancestor stacking context, and bumped z-index to `z-999` for extra safety

## Restart Feature

- [x] Remove the "Erase" button from the game toolbar
- [x] Add a "Restart" button in its place
- [x] Clicking "Restart" opens a confirmation `Dialog` (uses core/ui `Dialog` + `Button`)
- [x] On confirm: reset `board` back to the original given values (clear all user-entered values), clear all memos, keep `given` mask unchanged, reset timer to 0 and keep it running (or paused state as appropriate), reset hint/undo history state as appropriate
- [x] On cancel: close dialog with no changes

## Cupertino Theme

- [x] Add `cupertino` to `UiTheme` union type and `VALID_THEMES` in `core/ui/src/theme/theme-context.tsx`
- [x] Add Cupertino-style button variants to `core/ui/src/components/button.tsx` (iOS system blue `#007AFF`, rounded rectangle, no border on primary)
- [x] Add Cupertino segmented control style to `core/ui/src/components/tabs.tsx` (gray pill track, white selected tab with shadow)
- [x] Add Cupertino alert/sheet style to `core/ui/src/components/dialog.tsx` (white panel, `bg-black/40` backdrop, `rounded-2xl`)
- [x] Update `App.tsx` to handle Cupertino background (`#F2F2F7`) and white card surface
- [x] Add `cupertino` option to theme selector in `apps/sudoku/src/pages/menu.tsx`
- [x] Add Cupertino styles to `NumberHintBar` (white container, iOS blue active state)
- [x] Add Cupertino styles to `BoardCell` (white normal, `#007AFF/15` selected, `#007AFF/10` highlighted, `#F2F2F7` given)
- [x] Add Cupertino styles to `Timer` (white panel, light border)

## Undo/Redo Feature

- [x] Add icon-only Undo and Redo buttons next to the `Save` button (use simple icon glyphs/svg, no text label)
- [x] Maintain an undo/redo history stack (max 40 entries) of user actions: writing a value, deleting a value, adding a memo, removing a memo
- [x] Exclude non-content actions from history: cell focus/selection, blur, text selection, hover, hint-mode toggling
- [x] Undo button reverts the most recent action in history; disabled when history is empty (nothing to undo)
- [x] Redo button re-applies the most recently undone action; disabled when redo stack is empty (nothing to redo)
- [x] Performing a new action after undo(s) clears the redo stack (standard undo/redo semantics)
- [x] Persist/restore behavior should not break existing Save/Load flow (history can reset on load, since it's a fresh session)

## Glassmorphism UI

- [x] Applied frosted-glass styling (translucent backgrounds, backdrop blur, soft borders/shadows) across `core/ui` `Button`, `Dialog`, `Tabs`, and app-specific `Board`, `NumberHintBar`, `Timer`, `Leaderboard`, `App` shell

## Theme Switcher (Glassmorphism / Neumorphism)

- [x] `core/ui`: Add a `ThemeProvider` + `useTheme` hook (React context) supporting `"glass" | "neumorphism"`, persisted to `localStorage` (`uiTheme`), defaulting to `"glass"`
- [x] `core/ui`: Wrap `Button`, `Dialog`, `Tabs` internals to branch their className/style per active theme instead of hardcoded glass classes
  - Neumorphism style: soft matte background (e.g. `bg-gray-100`/`bg-slate-200`), no borders, dual soft shadows (light top-left, dark bottom-right) for "extruded" look, and inset shadows for pressed/active/selected states
- [x] `apps/sudoku`: Wrap `App` root with `ThemeProvider`
- [x] `apps/sudoku`: Update `App.tsx` background, `Board`/`BoardCell`, `NumberHintBar`, `Timer` to branch styling per theme (flat neumorphic surface + soft shadows instead of blur/translucency when theme is `"neumorphism"`)
- [x] Add a "Theme" toggle control in the `Menu` page (e.g. segmented `Tabs` or icon buttons) to switch between Glassmorphism and Neumorphism live
- [x] Verify no TypeScript/lint errors across changed files; rebuild `core/ui` after changes

## Save Confirmation, Back Button, Hint Bar Placeholder, Material Theme

- [x] Clicking "Save" on the game page opens a confirmation `Dialog` before actually saving + navigating away (uses core/ui `Dialog` + `Button`); confirm saves and returns to menu, cancel closes dialog with no changes
- [x] Add a "Back" button on the game page (navigates to menu without saving); should prompt/pause appropriately similar to other navigation actions
- [x] When game is paused, hide `NumberHintBar` and the Hint `Button` visually but reserve their layout space (e.g. `invisible` instead of unmounting/conditional render) so the page doesn't shift
- [x] `core/ui`: Add a third `"material"` theme option to `ThemeProvider`/`useTheme` (Material Design style: elevation shadows, solid fill colors, ripple-like hover/active states) and make it the new default theme
- [x] `core/ui`: Branch `Button`, `Dialog`, `Tabs` styling for the `"material"` theme
- [x] `apps/sudoku`: Branch `App.tsx`, `Board`/`BoardCell`, `NumberHintBar`, `Timer` styling for the `"material"` theme
- [x] Update `Menu` page's Theme `Tabs` to include all three options (Glass / Neumorphism / Material)
- [x] Verify no TypeScript/lint errors across changed files; rebuild `core/ui` after changes

## Board Validation

### Fix: `text-red-500` not applying to cell text
- [x] Root cause: `BoardCell` input and given-value span have hardcoded text color classes (`text-gray-900` / `text-gray-800`) that block CSS inheritance from a parent; parent-level `text-red-500` cannot override them
- [x] Fix: make the text color class dynamic on the input/span directly, driven by the new `isInvalid` prop

### Cell-level conflict highlighting
- [x] Add `isInvalid?: boolean` prop to `BoardCell`; invalid cells show a red background tint and red text (user-placed only — given cells are never invalid)
- [x] Add `invalidCells?: boolean[][]` prop to `Board` and thread it down to each `BoardCell`
- [x] `computeInvalidCells(board, given)` in `game.tsx`: for every non-given, non-empty cell check for duplicate value in its row, column, or 3×3 box; mark as invalid if any conflict found

### Board completability ("Game Over")
- [x] `isBoardSolvable(board)` in `game.tsx`: backtracking solver that treats all currently filled cells as fixed and tries to complete the remaining empty cells; returns `false` when no completion is possible
- [x] After every user move that places a value (`newValue !== 0`): if the board has any invalid cells OR the solver returns `false`, set `showGameOverDialog = true`; reset when the board returns to a solvable state
- [x] "Game Over" `Dialog` (title "Game Over") explains the board cannot be completed; offers "Restart" (triggers full restart) and "Dismiss" (closes dialog without restarting — user keeps the broken state)
