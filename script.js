const original = [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20],
  [21, 22, 23, 24, 0],
];

let puzzle;
let emptyX;
let emptyY;
let locked;

const ROWS = 5;
const COLS = 5;
const WAIT_TIME = 15;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function update() {
  let html = "";
  for (let y = 0; y < ROWS; y++) {
    html += "<tr>";
    for (let x = 0; x < COLS; x++) {
      const t = puzzle[y][x];
      html += "<td>" + (t ? t : "") + "</td>";
    }
    html += "</tr>";
  }
  document.getElementById("puzzle").innerHTML = html;
}

function reset() {
  puzzle = original.map(r => r.slice());
  emptyX = COLS - 1;
  emptyY = ROWS - 1;
  locked = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  update();
}

async function slide(dx, dy, wait = false) {
  const nx = emptyX + dx;
  const ny = emptyY + dy;
  if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return false;
  [puzzle[emptyY][emptyX], puzzle[ny][nx]] = [puzzle[ny][nx], puzzle[emptyY][emptyX]];
  emptyX = nx; emptyY = ny;
  if (wait) await sleep(WAIT_TIME);
  update();
  return true;
}

function find(n) {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (puzzle[y][x] === n) return [x, y];
    }
  }
  return [-1, -1];
}

async function placeTwoTiles(nA, targetAX, targetAY, nB, targetBX, targetBY) {
  let [ax, ay] = find(nA);
  let [bx, by] = find(nB);

  if (ax === targetAX && ay === targetAY && bx === targetBX && by === targetBY) return true;

  const key = (ex, ey, ax, ay, bx, by) => `${ex},${ey},${ax},${ay},${bx},${by}`;
  const start = { ex: emptyX, ey: emptyY, ax, ay, bx, by };
  const prev = new Map();
  prev.set(key(emptyX, emptyY, ax, ay, bx, by), null);
  const queue = [start];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let goal = null;

  while (queue.length) {
    const s = queue.shift();
    if (s.ax === targetAX && s.ay === targetAY && s.bx === targetBX && s.by === targetBY) {
      goal = s; break;
    }

    for (const [dx, dy] of dirs) {
      const nex = s.ex + dx, ney = s.ey + dy;
      if (nex < 0 || nex >= COLS || ney < 0 || ney >= ROWS) continue;
      if (locked[ney][nex]) continue;

      let nax = s.ax, nay = s.ay, nbx = s.bx, nby = s.by;
      if (nex === s.ax && ney === s.ay) { nax = s.ex; nay = s.ey; }
      else if (nex === s.bx && ney === s.by) { nbx = s.ex; nby = s.ey; }

      const k = key(nex, ney, nax, nay, nbx, nby);
      if (!prev.has(k)) {
        prev.set(k, { from: s, dx, dy });
        queue.push({ ex: nex, ey: ney, ax: nax, ay: nay, bx: nbx, by: nby });
      }
    }
  }

  if (!goal) { console.error("placeTwoTiles: no path", nA, nB); return false; }

  const moves = [];
  let cur = goal;
  while (true) {
    const k = key(cur.ex, cur.ey, cur.ax, cur.ay, cur.bx, cur.by);
    const p = prev.get(k);
    if (!p) break;
    moves.push([p.dx, p.dy]);
    cur = p.from;
  }
  moves.reverse();
  for (const [dx, dy] of moves) await slide(dx, dy, true);

  [ax, ay] = find(nA);
  [bx, by] = find(nB);
  if (ax !== targetAX || ay !== targetAY || bx !== targetBX || by !== targetBY) {
    console.error("placeTwoTiles verify failed", nA, nB);
    return false;
  }
  return true;
}

async function placeTile(n, targetX, targetY) {
  let [tx, ty] = find(n);
  if (tx === targetX && ty === targetY) {
    locked[targetY][targetX] = true;
    return true;
  }

  const startKey = `${emptyX},${emptyY},${tx},${ty}`;
  const prev = new Map();
  prev.set(startKey, null);
  const queue = [{ ex: emptyX, ey: emptyY, tx, ty }];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let goal = null;

  while (queue.length) {
    const s = queue.shift();
    if (s.tx === targetX && s.ty === targetY) { goal = s; break; }

    for (const [dx, dy] of dirs) {
      const nex = s.ex + dx, ney = s.ey + dy;
      if (nex < 0 || nex >= COLS || ney < 0 || ney >= ROWS) continue;
      if (locked[ney][nex]) continue;

      let ntx = s.tx, nty = s.ty;
      if (nex === s.tx && ney === s.ty) { ntx = s.ex; nty = s.ey; }

      const k = `${nex},${ney},${ntx},${nty}`;
      if (!prev.has(k)) {
        prev.set(k, { from: s, dx, dy });
        queue.push({ ex: nex, ey: ney, tx: ntx, ty: nty });
      }
    }
  }

  if (!goal) { console.error("placeTile: no path", n); return false; }

  const moves = [];
  let cur = goal;
  while (true) {
    const k = `${cur.ex},${cur.ey},${cur.tx},${cur.ty}`;
    const p = prev.get(k);
    if (!p) break;
    moves.push([p.dx, p.dy]);
    cur = p.from;
  }
  moves.reverse();
  for (const [dx, dy] of moves) await slide(dx, dy, true);

  [tx, ty] = find(n);
  if (tx !== targetX || ty !== targetY) {
    console.error("placeTile verify failed", n);
    return false;
  }
  locked[targetY][targetX] = true;
  return true;
}

async function solve2x2() {
  const cells = [
    [COLS - 2, ROWS - 2], [COLS - 1, ROWS - 2],
    [COLS - 2, ROWS - 1], [COLS - 1, ROWS - 1],
  ];
  const target = [
    (ROWS - 2) * COLS + (COLS - 2) + 1,
    (ROWS - 2) * COLS + (COLS - 1) + 1,
    (ROWS - 1) * COLS + (COLS - 2) + 1,
    0,
  ];

  const start = cells.map(([x, y]) => puzzle[y][x]);
  if (start.join(",") === target.join(",")) return;

  const q = [start];
  const prev = new Map();
  prev.set(start.join(","), null);
  let endState = null;

  while (q.length) {
    const state = q.shift();
    if (state.join(",") === target.join(",")) { endState = state; break; }
    const zero = state.indexOf(0);
    if (zero === -1) { console.error("2x2: empty missing"); return; }
    const neigh = { 0: [1, 2], 1: [0, 3], 2: [0, 3], 3: [1, 2] };
    for (const ni of neigh[zero]) {
      const ns = state.slice();
      [ns[zero], ns[ni]] = [ns[ni], ns[zero]];
      const k = ns.join(",");
      if (!prev.has(k)) {
        prev.set(k, { state: state.slice(), zero, ni });
        q.push(ns);
      }
    }
  }

  if (!endState) { console.error("2x2 unsolvable", start); return; }

  const moves = [];
  let cur = endState;
  while (true) {
    const p = prev.get(cur.join(","));
    if (!p) break;
    moves.push({ from: p.zero, to: p.ni });
    cur = p.state;
  }
  moves.reverse();

  for (const m of moves) {
    const [fx, fy] = cells[m.from];
    const [tx, ty] = cells[m.to];
    await slide(tx - fx, ty - fy, true);
  }
}

async function solve() {
  locked = Array.from({ length: ROWS }, () => Array(COLS).fill(false));

  for (let r = 0; r < ROWS - 2; r++) {
    for (let c = 0; c < COLS - 2; c++) {
      const n = r * COLS + c + 1;
      await placeTile(n, c, r);
    }
    const nA = r * COLS + (COLS - 2) + 1;
    const nB = r * COLS + (COLS - 1) + 1;
    await placeTwoTiles(nA, COLS - 2, r, nB, COLS - 1, r);
    locked[r][COLS - 2] = true;
    locked[r][COLS - 1] = true;
  }

  const rTop = ROWS - 2;
  for (let c = 0; c < COLS - 2; c++) {
    const nTop = rTop * COLS + c + 1;
    const nBot = (rTop + 1) * COLS + c + 1;
    await placeTwoTiles(nTop, c, rTop, nBot, c, rTop + 1);
    locked[rTop][c] = true;
    locked[rTop + 1][c] = true;
  }

  await solve2x2();
  update();
}

async function shuffle() {
  reset();
  for (let i = 0; i < 200; i++) {
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const valid = dirs.filter(([dx, dy]) => {
      const nx = emptyX + dx, ny = emptyY + dy;
      return nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS;
    });
    const [dx, dy] = valid[Math.floor(Math.random() * valid.length)];
    await slide(dx, dy, false);
  }
  update();
}

reset();

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowRight") slide(1, 0);
  else if (event.key === "ArrowLeft") slide(-1, 0);
  else if (event.key === "ArrowUp") slide(0, -1);
  else if (event.key === "ArrowDown") slide(0, 1);
});
