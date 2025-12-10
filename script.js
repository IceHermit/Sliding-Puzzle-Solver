const original = [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20],
  [21, 22, 23, 24, 0],
];
var puzzle = [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20],
  [21, 22, 23, 24, 0],
];

var emptyX = 4;
var emptyY = 4;

const ROWS = 5;
const COLS = 5;

const WAIT_TIME = 100;

update();

document.addEventListener("keydown", function (event) {
  if (event.key == "ArrowRight") slide(1, 0);
  else if (event.key == "ArrowLeft") slide(-1, 0);
  else if (event.key == "ArrowUp") slide(0, -1);
  else if (event.key == "ArrowDown") slide(0, 1);
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function slide(dx, dy, wait = false) {
  if (dx && emptyX + dx >= 0 && emptyX + dx < puzzle[0].length) {
    [puzzle[emptyY][emptyX + dx], puzzle[emptyY][emptyX]] = [
      puzzle[emptyY][emptyX],
      puzzle[emptyY][emptyX + dx],
    ];
    emptyX += dx;
  } else if (dy && emptyY + dy >= 0 && emptyY + dy < puzzle.length) {
    [puzzle[emptyY + dy][emptyX], puzzle[emptyY][emptyX]] = [
      puzzle[emptyY][emptyX],
      puzzle[emptyY + dy][emptyX],
    ];
    emptyY += dy;
  }

  if (wait) await sleep(WAIT_TIME);

  update();
}

function find(n) {
  for (let y = 0; y < puzzle.length; y++) {
    const row = puzzle[y];
    for (let x = 0; x < row.length; x++) {
      const element = row[x];
      if (element == n) return [x, y];
    }
  }
  return [-1, -1];
}

visited = [
  [false, false, false, false, false],
  [false, false, false, false, false],
  [false, false, false, false, false],
  [false, false, false, false, false],
  [false, false, false, false, false],
];
map = [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
];

function dfs(x, y, targetX, targetY, moves = "X") {
  if (x == targetX && y == targetY) return moves;

  if (x < 0 || y < 0 || x >= COLS || y >= ROWS || map[y][x] || visited[y][x])
    return false;

  visited[y][x] = true;

  let l = dfs(x - 1, y, targetX, targetY, moves + "L");
  let r = dfs(x + 1, y, targetX, targetY, moves + "R");
  let u = dfs(x, y - 1, targetX, targetY, moves + "U");
  let d = dfs(x, y + 1, targetX, targetY, moves + "D");

  if (l) return l;
  else if (r) return r;
  else if (u) return u;
  else if (d) return d;

  return false;
}

async function moveto(x, y) {
  let moves = dfs(emptyX, emptyY, x, y);

  console.log(
    "moving from " +
      emptyX +
      ", " +
      emptyY +
      " to " +
      x +
      ", " +
      y +
      "\nMoves: " +
      moves
  );

  if (moves == false) return false;

  for (let i = 0; i < moves.length; i += 1) {
    let c = moves[i];

    if (c == "L") {
      await slide(-1, 0, true);
    } else if (c == "R") {
      await slide(1, 0, true);
    } else if (c == "U") {
      await slide(0, -1, true);
    } else if (c == "D") {
      await slide(0, 1, true);
    }
  }

  //console.log("movement successful, returning true");
  return true;
}

function reset() {
  puzzle = original;
  emptyX = 4;
  emptyY = 4;
  update();
}

var rendered_map = null;

function update() {
  var innerhtml = "";

  for (let y = 0; y < puzzle.length; y++) {
    const row = puzzle[y];
    innerhtml += "<tr>";
    for (let x = 0; x < row.length; x++) {
      const tile = row[x];
      var tag = "";
      if (rendered_map) if (rendered_map[y][x]) tag = "class= 'blocked'";

      innerhtml += "<td " + tag + ">" + (tile ? tile : "") + "</td>";
    }
    innerhtml += "</tr>";
  }

  document.getElementById("puzzle").innerHTML = innerhtml;
}

function render(avoidX, avoidY, n) {
  //visited = [[false,false,false],[false,false,false],[false,false,false]];
  //map = [[0,0,0],[0,0,0],[0,0,0]];

  visited = [
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
  ];
  map = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];

  let i = 1;
  while (i < n) {
    [x, y] = find(i);
    map[y][x] = 1;
    i += 1;
  }

  map[avoidY][avoidX] = 1;

  rendered_map = map;

  console.log("rendered for: (" + avoidX + ", " + avoidY + ", " + n + ")");
  map.forEach((row) => {
    console.log(row);
  });
}

async function shuffle() {
  for (let i = 0; i < 20; i++) {
    let move = Math.floor(Math.random() * 4);
    if (move == 0) {
      await slide(0, 1, true);
      await slide(1, 0, true);
      await slide(0, -1, true);
      await slide(-1, 0, true);
    } else if (move == 1) {
      await slide(0, -1, true);
      await slide(0, 1, true);
      await slide(0, -1, true);
      await slide(0, -1, true);
    } else if (move == 2) {
      await slide(1, 0, true);
      await slide(0, 1, true);
      await slide(1, 0, true);
      await slide(0, 1, true);
      await slide(1, 0, true);
    } else if (move == 3) {
      await slide(-1, 0, true);
      await slide(0, -1, true);
      await slide(-1, 0, true);
      await slide(0, -1, true);
      await slide(-1, 0, true);
    }
  }
  await moveto(COLS - 1, ROWS - 1);
}

async function solve(n = 1, render_offset = 0, row_end = false) {
  if (n > ROWS * COLS) return;

  console.log("Solve(" + n + ", " + render_offset + ", " + row_end + ")");

  targetY = Math.floor((n - 1) / COLS);
  targetX = (n - 1) % COLS;

  if (targetX == COLS - 2) {
    console.log("m-2 type");
    targetX++;
  } else if (targetX == COLS - 1) {
    console.log("m-1 type");
    targetY++;
  } else if (targetX == 0 && targetY != 0 && row_end) {
    console.log("executing maneuver");
    render(0, 0, n - 1);
    await moveto(COLS - 2, targetY);
    await slide(0, -1, true);
    await slide(1, 0, true);
    await slide(0, 1, true);
  }

  [currX, currY] = find(n);

  render(currX, currY, n - render_offset);

  if (currX == targetX && currY == targetY) {
    console.log(
      "Target(" +
        n +
        ") reached place: " +
        currX +
        ", " +
        currY +
        "=" +
        targetX +
        ", " +
        targetY
    );
    update();
    if (render_offset) {
      console.log(
        "solved the submaze using render_offset, now solving for n = " +
          (n - render_offset >= 1)
          ? n - render_offset
          : 1
      );
      await solve(n - render_offset >= 1 ? n - render_offset : 1);
    } else {
      if (n % COLS == 0 && n != 1) await solve(n + 1, render_offset, true);
      else await solve(n + 1);
    }
    return;
  }

  if (currX > targetX) {
    if (await moveto(currX - 1, currY)) await slide(1, 0, true);
    else {
      console.log(
        "can't solve this maze, going back by: " + (render_offset + 1)
      );
      await solve(n, render_offset + 1);
      return;
    }
  } else if (currX < targetX) {
    if (await moveto(currX + 1, currY)) await slide(-1, 0, true);
    else {
      console.log(
        "can't solve this maze, going back by: " + (render_offset + 1)
      );
      await solve(n, render_offset + 1);
      return;
    }
  } else if (currY > targetY) {
    if (await moveto(currX, currY - 1)) {
      await slide(0, 1, true);
    } else {
      console.log(
        "can't solve this maze, going back by: " + (render_offset + 1)
      );
      await solve(n, render_offset + 1);
      return;
    }
  }

  await solve(n, render_offset);
}
