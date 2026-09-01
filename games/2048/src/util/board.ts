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

// Applies a slide+merge in `direction`, preserving tile identity so movement
// can be animated. Merged pairs collapse into the leading tile's id.
export const move = (
  tiles: Tile[],
  direction: Direction,
): { tiles: Tile[]; moved: boolean; gained: number } => {
  const byPos = new Map<string, Tile>();
  for (const t of tiles) byPos.set(`${t.row},${t.col}`, t);

  const result: Tile[] = [];
  let gained = 0;
  let moved = false;

  for (let lineIndex = 0; lineIndex < BOARD_SIZE; lineIndex++) {
    const positions = getLine(direction, lineIndex);
    const lineTiles = positions
      .map(([r, c]) => byPos.get(`${r},${c}`))
      .filter((t): t is Tile => t !== undefined);

    const merged: Tile[] = [];
    let skipNext = false;
    for (let i = 0; i < lineTiles.length; i++) {
      if (skipNext) {
        skipNext = false;
        continue;
      }
      const current = lineTiles[i];
      const next = lineTiles[i + 1];
      if (next && next.value === current.value) {
        const mergedValue = current.value * 2;
        gained += mergedValue;
        merged.push({ ...current, value: mergedValue });
        skipNext = true;
      } else {
        merged.push({ ...current });
      }
    }

    merged.forEach((tile, i) => {
      const [row, col] = positions[i];
      if (tile.row !== row || tile.col !== col) moved = true;
      tile.row = row;
      tile.col = col;
    });

    result.push(...merged);
  }

  // A merge always changes the board even if the surviving tile didn't move.
  if (result.length !== tiles.length) moved = true;

  return { tiles: result, moved, gained };
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
