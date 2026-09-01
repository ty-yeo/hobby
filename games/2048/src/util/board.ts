export const BOARD_SIZE = 4;

export type Direction = "up" | "down" | "left" | "right";

export type Tile = {
  id: number;
  row: number;
  col: number;
  value: number;
};

// Tiles keep a stable `id` across moves so React can animate a tile's
// position (rather than re-mounting a fresh DOM node every move).
let nextId = 1;
const createTileId = () => nextId++;

const emptyCells = (tiles: Tile[]): [number, number][] => {
  const occupied = new Set(tiles.map((t) => `${t.row},${t.col}`));
  const empties: [number, number][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!occupied.has(`${r},${c}`)) empties.push([r, c]);
    }
  }
  return empties;
};

// Fills one random empty cell with a 2 (90%) or a 4 (10%).
export const spawnRandomTile = (tiles: Tile[]): Tile[] => {
  const empties = emptyCells(tiles);
  if (empties.length === 0) return tiles;

  const [row, col] = empties[Math.floor(Math.random() * empties.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  return [...tiles, { id: createTileId(), row, col, value }];
};

export const createInitialTiles = (): Tile[] =>
  spawnRandomTile(spawnRandomTile([]));

// Returns the 4 positions of a line ordered from the far edge toward the
// direction of travel, so index 0 is where a tile ends up first.
const getLine = (direction: Direction, index: number): [number, number][] => {
  const seq = [0, 1, 2, 3];
  switch (direction) {
    case "left":
      return seq.map((col) => [index, col]);
    case "right":
      return seq.map((col) => [index, BOARD_SIZE - 1 - col]);
    case "up":
      return seq.map((row) => [row, index]);
    case "down":
      return seq.map((row) => [BOARD_SIZE - 1 - row, index]);
  }
};

// Slides tiles toward `direction` and reports two snapshots so callers can
// animate sliding and merging as separate steps:
//   - `slid`: every original tile repositioned to its post-slide slot —
//     a merging pair both land on the *same* cell, values unchanged.
//   - `tiles`: the final collapsed result — merged pairs become one tile
//     (keeping the leading tile's id) with the doubled value.
export const move = (
  tiles: Tile[],
  direction: Direction,
): { tiles: Tile[]; slid: Tile[]; moved: boolean; gained: number } => {
  const byPos = new Map<string, Tile>();
  for (const t of tiles) byPos.set(`${t.row},${t.col}`, t);

  const merged: Tile[] = [];
  const slid: Tile[] = [];
  let gained = 0;
  let moved = false;

  for (let lineIndex = 0; lineIndex < BOARD_SIZE; lineIndex++) {
    const positions = getLine(direction, lineIndex);
    const lineTiles = positions
      .map(([r, c]) => byPos.get(`${r},${c}`))
      .filter((t): t is Tile => t !== undefined);

    let destIndex = 0;
    let i = 0;
    while (i < lineTiles.length) {
      const current = lineTiles[i];
      const next = lineTiles[i + 1];
      const [destRow, destCol] = positions[destIndex];
      if (current.row !== destRow || current.col !== destCol) moved = true;

      if (next && next.value === current.value) {
        gained += current.value * 2;
        slid.push({ ...current, row: destRow, col: destCol });
        slid.push({ ...next, row: destRow, col: destCol });
        merged.push({
          ...current,
          value: current.value * 2,
          row: destRow,
          col: destCol,
        });
        i += 2;
      } else {
        slid.push({ ...current, row: destRow, col: destCol });
        merged.push({ ...current, row: destRow, col: destCol });
        i += 1;
      }
      destIndex += 1;
    }
  }

  // A merge always changes the board even if the surviving tile didn't move.
  if (merged.length !== tiles.length) moved = true;

  return { tiles: merged, slid, moved, gained };
};

export const hasAvailableMoves = (tiles: Tile[]): boolean => {
  if (tiles.length < BOARD_SIZE * BOARD_SIZE) return true;

  const grid: number[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(0),
  );
  for (const t of tiles) grid[t.row][t.col] = t.value;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (c + 1 < BOARD_SIZE && grid[r][c] === grid[r][c + 1]) return true;
      if (r + 1 < BOARD_SIZE && grid[r][c] === grid[r + 1][c]) return true;
    }
  }
  return false;
};

export const hasReachedTarget = (tiles: Tile[], target = 2048): boolean =>
  tiles.some((t) => t.value >= target);
