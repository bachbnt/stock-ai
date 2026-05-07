export const COLOR_UP = '#16c784';
export const COLOR_DOWN = '#ea3943';
export const COLOR_FLAT = '#f0b90b';
export const COLOR_NONE = '#858ca2';

/**
 * Price/change color rule:
 *   no price → gray
 *   has price, no change or change = 0 → yellow
 *   change > 0 → green, change < 0 → red
 */
export function quoteColor(hasPrice: boolean, change: number | null | undefined): string {
  if (!hasPrice) return COLOR_NONE;
  if (change == null || change === 0) return COLOR_FLAT;
  return change > 0 ? COLOR_UP : COLOR_DOWN;
}
