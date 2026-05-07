// Semantic: data-driven (up/down/flat/missing)
export const COLOR_UP   = '#16c784';
export const COLOR_DOWN = '#ea3943';
export const COLOR_FLAT = '#f0b90b';
export const COLOR_NONE = '#858ca2';

// Structural palette — mirrors tailwind.config.js custom tokens
export const COLOR_TEXT       = '#ffffff';
export const COLOR_BG_PRIMARY = '#0d0e11';
export const COLOR_BG_CARD    = '#1a1b1e';
export const COLOR_BG_HOVER   = '#22232a';
export const COLOR_BORDER     = '#2a2b2e';
export const COLOR_ACCENT     = '#3861fb';

/**
 * Price/change color:
 *   no price  → gray
 *   has price, no change or change = 0 → yellow
 *   change > 0 → green, change < 0 → red
 */
export function quoteColor(hasPrice: boolean, change: number | null | undefined): string {
  if (!hasPrice) return COLOR_NONE;
  if (change == null || change === 0) return COLOR_FLAT;
  return change > 0 ? COLOR_UP : COLOR_DOWN;
}

/**
 * P&L / signed value color:
 *   > 0 → green, < 0 → red, = 0 → gray
 */
export function pnlColor(v: number): string {
  if (v > 0) return COLOR_UP;
  if (v < 0) return COLOR_DOWN;
  return COLOR_NONE;
}

/** Buy → green, sell → red. */
export function txTypeColor(type: 'buy' | 'sell'): string {
  return type === 'buy' ? COLOR_UP : COLOR_DOWN;
}

/** Single-direction trend: positive → green, otherwise → red. */
export function trendColor(isPositive: boolean): string {
  return isPositive ? COLOR_UP : COLOR_DOWN;
}
