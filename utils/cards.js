function range(n1, n2) {
  const out = [];
  for (let i = n1; i <= n2; i++) out.push(i);
  return out;
}
function sample(arr, n) {
  const res = [];
  const src = arr.slice();
  while (res.length < n) {
    const i = Math.floor(Math.random() * src.length);
    res.push(src.splice(i,1)[0]);
  }
  return res;
}

function generateCard() {
  // 5x5 card using Bingo ranges
  const B = sample(range(1,15),5);
  const I = sample(range(16,30),5);
  const N = sample(range(31,45),5);
  const G = sample(range(46,60),5);
  const O = sample(range(61,75),5);
  const grid = [];
  for (let r=0;r<5;r++) {
    grid[r] = [B[r], I[r], N[r], G[r], O[r]];
  }
  // center free
  grid[2][2] = null;
  const marks = Array.from({length:5}, ()=> Array(5).fill(false));
  marks[2][2] = true;
  return { grid, marks };
}

module.exports = { generateCard };
