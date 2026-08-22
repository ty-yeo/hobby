export const isBoardFull = (board: number[][]): boolean => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) return false;
    }
  }
  return true;
};

const isValidGroup = (values: number[]): boolean => {
  const seen = new Set<number>();
  for (const v of values) {
    if (v < 1 || v > 9 || seen.has(v)) return false;
    seen.add(v);
  }
  return true;
};

export const isBoardValid = (board: number[][]): boolean => {
  for (let i = 0; i < 9; i++) {
    if (!isValidGroup(board[i])) return false;
    if (!isValidGroup(board.map((r) => r[i]))) return false;
  }
  for (let br = 0; br < 9; br += 3) {
    for (let bc = 0; bc < 9; bc += 3) {
      const box: number[] = [];
      for (let r = br; r < br + 3; r++)
        for (let c = bc; c < bc + 3; c++) box.push(board[r][c]);
      if (!isValidGroup(box)) return false;
    }
  }
  return true;
};

export const isBoardComplete = (board: number[][]): boolean =>
  isBoardFull(board) && isBoardValid(board);

export const computeInvalidCells = (
  board: number[][],
  given: boolean[][],
): boolean[][] => {
  const invalid: boolean[][] = Array.from({ length: 9 }, () =>
    Array(9).fill(false),
  );
  if (board.length < 9 || board[0]?.length < 9) return invalid;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r]?.[c];
      if (val === undefined || val === 0 || given[r]?.[c]) continue;

      for (let i = 0; i < 9; i++) {
        if (i !== c && board[r][i] === val) { invalid[r][c] = true; break; }
      }
      if (invalid[r][c]) continue;
      for (let i = 0; i < 9; i++) {
        if (i !== r && board[i][c] === val) { invalid[r][c] = true; break; }
      }
      if (invalid[r][c]) continue;
      const boxR = Math.floor(r / 3) * 3;
      const boxC = Math.floor(c / 3) * 3;
      outer: for (let br = boxR; br < boxR + 3; br++) {
        for (let bc = boxC; bc < boxC + 3; bc++) {
          if ((br !== r || bc !== c) && board[br][bc] === val) {
            invalid[r][c] = true;
            break outer;
          }
        }
      }
    }
  }
  return invalid;
};

const isValidAt = (board: number[][], r: number, c: number, num: number): boolean => {
  for (let i = 0; i < 9; i++) {
    if (board[r][i] === num || board[i][c] === num) return false;
  }
  const boxR = Math.floor(r / 3) * 3;
  const boxC = Math.floor(c / 3) * 3;
  for (let br = boxR; br < boxR + 3; br++)
    for (let bc = boxC; bc < boxC + 3; bc++)
      if (board[br][bc] === num) return false;
  return true;
};

const solve = (grid: number[][]): boolean => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidAt(grid, r, c, num)) {
            grid[r][c] = num;
            if (solve(grid)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

export const isBoardSolvable = (board: number[][]): boolean =>
  solve(board.map((row) => [...row]));

export const shouldHighlightCell = (
  board: number[][],
  row: number,
  col: number,
  num: number,
): boolean => {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return true;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++)
    for (let c = boxCol; c < boxCol + 3; c++)
      if (board[r][c] === num) return true;
  return false;
};
