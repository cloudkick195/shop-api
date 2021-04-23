export function range(start: number, end: number): any {
  return Array(end - start + 1).fill(1).map((_, index: number) => start + index);
}
