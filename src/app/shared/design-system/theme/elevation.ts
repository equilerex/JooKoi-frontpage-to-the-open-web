/**
 * One elevation scale for the whole app. These numbers are the same values as
 * the --z-* tokens in src/styles/design-tokens.css; PrimeNG's overlay manager
 * is JavaScript-side and cannot read CSS custom properties, so it is configured
 * from here. Change one, change the other.
 */
export const ELEVATION = {
  dock: 100,
  hud: 200,
  menu: 1000,
  overlay: 1100,
  modal: 1200,
  tooltip: 1300,
} as const;
