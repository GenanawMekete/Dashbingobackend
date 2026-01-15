function isWinningBoard(grid, calledSet) {
  const size = grid.length;

  const isCalled = (r, c) => {
    const val = grid[r][c];
    if (val === null) return true; // free
    return calledSet.has(val);
  };

  // rows
  for (let r = 0; r < size; r++) {
    let ok = true;
    for (let c = 0; c < size; c++) if (!isCalled(r, c)) { ok = false; break; }
    if (ok) return true;
  }

  // columns
  for (let c = 0; c < size; c++) {
    let ok = true;
    for (let r = 0; r < size; r++) if (!isCalled(r, c)) { ok = false; break; }
    if (ok) return true;
  }

  // diagonal TL-BR
  let ok = true;
  for (let i = 0; i < size; i++) if (!isCalled(i, i)) { ok = false; break; }
  if (ok) return true;

  // diagonal TR-BL
  ok = true;
  for (let i = 0; i < size; i++) if (!isCalled(i, size - 1 - i)) { ok = false; break; }
  if (ok) return true;

  return false;
}

module.exports = { isWinningBoard };
