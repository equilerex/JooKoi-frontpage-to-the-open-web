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
      // Aura defaults this to {surface.400} — a light-theme grey off our
      // palette. The mockup has no hover rule at all, but a static mockup
      // cannot express hover and a control that does nothing on hover is the
      // worse defect, so it stays and is retargeted onto the chrome edge
      // colour `--key-rim` (--p-void-500), one step up the void ramp from the
      // resting `--border-chrome` (--p-void-600) and deliberately not the
      // cyan focus ring, which hover must not imitate.
      hoverBorderColor: 'var(--key-rim)',
      borderRadius: 'var(--radius-chip)',
      // Aura's `typography.font.weight` is `normal`; the mockup's controls are
      // all 500.
      fontWeight: '500',
      // Aura gives every form field `0 1px 2px rgba(18,18,23,0.05)`. The
      // mockup's chrome controls are flat — `.key`, `.panel` and `.select`
      // share that treatment — so a drop shadow contradicts the design rather
      // than extending it.
      shadow: 'none',
      paddingX: 'var(--space-3)',
      // Not a spacing token, and deliberately: Aura's `line-height: 1.5` puts
      // a 0.875rem label on a 21px line box and the field consumes two
      // 1px borders, so `var(--space-2)` measured 38.33px against the mockup's
      // standard 2.75rem control height. 0.65625rem (10.5px) makes the CSS
      // math land on exactly 44px: 21 + 2(10.5) + 2. The rounding has to live
      // in the padding because PrimeNG tokenises no height, and a local
      // `min-height` would desynchronise this control from every other
      // PrimeNG form field.
      paddingY: '0.65625rem',
    },
    // Aura sets `typography.fontFamily: 'inherit'`, and nothing above the app
    // shell sets a family — so every PrimeNG component rendered in the browser
    // default, measured as "Times New Roman". `--font-read` is the mockup's own
    // family for `.select` and the right default for PrimeNG's controls
    // generally.
    typography: {
      fontFamily: 'var(--font-read)',
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
        // Aura points both of these at `{highlight.*}`, its own emerald ramp,
        // and PrimeNG applies `.p-select-option-selected.p-focus` — the state a
        // selected row is in the moment the list opens on it, which is the
        // normal path, not an edge case. Measured in the browser with only the
        // two keys above set: the selected row rendered
        // `color(srgb 0.204 0.827 0.6 / 0.24)` (Aura's #34d399) inside a
        // cyan/void palette. Pinning both to the resting selected values keeps
        // a selected row looking the same whether or not it carries focus.
        selectedFocusBackground: 'var(--surface-inset)',
        selectedFocusColor: 'var(--text-accent)',
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
