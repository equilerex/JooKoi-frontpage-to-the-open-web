import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * PrimeNG preset mapped onto our semantic tokens (decision 011). Aura supplies
 * the structural token set; every value that is visible in our design is
 * redirected at a token we already own, so PrimeNG components follow the theme
 * without a second palette.
 *
 * Only the semantic layer is overridden here. Component-level fine-tuning
 * belongs in that component's own CSS, in the `components` cascade layer.
 *
 * Every key below was checked against node_modules/@primeuix/themes/dist/aura/index.mjs
 * for this installed version (3.0.0) before writing this file — definePreset
 * silently drops any key that doesn't exist in Aura's semantic shape, no error.
 * One correction from the plan's draft: Aura nests the overlay mask colour at
 * `mask.background`, not a flat `maskBackground` — the flat key does not exist
 * in Aura's semantic object and would have been silently dropped.
 */
export const jookoiPreset = definePreset(Aura, {
  semantic: {
    primary: {
      color: 'var(--text-accent)',
      contrastColor: 'var(--text-on-neon)',
      hoverColor: 'var(--p-cyan-300)',
      activeColor: 'var(--p-cyan-400)',
    },
    focusRing: {
      width: '2px',
      style: 'solid',
      color: 'var(--focus-ring)',
      offset: '2px',
    },
    formField: {
      background: 'var(--surface-chrome)',
      borderColor: 'var(--border-chrome)',
      color: 'var(--text-primary)',
      placeholderColor: 'var(--text-dim)',
      focusBorderColor: 'var(--focus-ring)',
      borderRadius: 'var(--radius-chip)',
      paddingX: 'var(--space-3)',
      paddingY: 'var(--space-2)',
    },
    overlay: {
      select: {
        background: 'var(--surface-panel)',
        borderColor: 'var(--border-panel)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius-panel)',
        shadow: '0 12px 32px var(--shadow-deep)',
      },
      popover: {
        background: 'var(--surface-panel)',
        borderColor: 'var(--border-panel)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius-panel)',
        shadow: '0 12px 32px var(--shadow-deep)',
      },
      modal: {
        background: 'var(--surface-panel)',
        borderColor: 'var(--border-panel)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius-panel)',
        shadow: '0 24px 64px var(--shadow-deep)',
      },
    },
    list: {
      option: {
        color: 'var(--text-muted)',
        focusColor: 'var(--text-primary)',
        selectedColor: 'var(--text-accent)',
        focusBackground: 'var(--surface-row-hover)',
        selectedBackground: 'var(--surface-inset)',
        borderRadius: 'var(--radius-chip)',
      },
    },
    content: {
      background: 'var(--surface-readout)',
      borderColor: 'var(--border-subtle)',
      color: 'var(--text-primary)',
      borderRadius: 'var(--radius-panel)',
    },
    text: {
      color: 'var(--text-primary)',
      mutedColor: 'var(--text-muted)',
    },
    mask: {
      background: 'var(--shadow-deep)',
    },
  },
});
