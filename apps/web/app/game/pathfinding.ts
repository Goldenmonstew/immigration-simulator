// Breadth-first search over a tile grid; returns the steps after `start`.
export type Cell = { x: number; y: number };

export const distance = (a: Cell, b: Cell) =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export function findPath(
  start: Cell,
  end: Cell,
  passable: (cell: Cell) => boolean,
  width: number,
): Cell[] {
  if (!passable(end)) return [];
  const w = width;
  const key = (c: Cell) => c.y * w + c.x;
  const parents = new Map<number, Cell>();
  const queue = [start];
  parents.set(key(start), start);
  for (let i = 0; i < queue.length; i++) {
    const c = queue[i];
    if (distance(c, end) === 0) break;
    for (const [dx, dy] of [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ]) {
      const n = { x: c.x + dx, y: c.y + dy };
      if (passable(n) && !parents.has(key(n))) {
        parents.set(key(n), c);
        queue.push(n);
      }
    }
  }
  if (!parents.has(key(end))) return [];
  const path = [];
  let c = end;
  while (distance(c, start) !== 0) {
    path.unshift(c);
    c = parents.get(key(c))!;
  }
  return path;
}
