/** Moves one id up or down a list. At either end the list stays as it is. */
export function moveInList(ids: string[], id: string, direction: 'up' | 'down') {
  const from = ids.indexOf(id);
  const to = direction === 'up' ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= ids.length) return ids;
  const next = [...ids];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}
