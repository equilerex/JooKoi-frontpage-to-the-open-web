// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');

// --- ADR 005: import-direction rules, generated from the src/app/ folder list ---
//
// Reads src/app/ at lint-config-load time (Node, not browser/build code) and
// classifies each top-level folder per the plan's placement rules:
//   - "app-shell" is the shell. Only app.routes.ts and app.component.ts may import it.
//   - "shared" (if present) holds shared/* subfolders. shared/design-system may be
//     imported by any shared/* folder; other shared/* folders must not import each
//     other. Nothing outside shared/design-system may be imported by
//     shared/design-system.
//   - Everything else at the top level of src/app/ is a feature folder. A feature
//     must never import another feature.
//
// New folders are picked up automatically on the next lint run — nothing here is
// hardcoded to a specific feature name.

const APP_DIR = path.join(__dirname, 'src', 'app');

/** @returns {string[]} top-level directory names under src/app/ */
function listTopLevelDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

const topLevelDirs = listTopLevelDirs(APP_DIR);
const hasAppShell = topLevelDirs.includes('app-shell');
const sharedDir = path.join(APP_DIR, 'shared');
const hasShared = topLevelDirs.includes('shared');
const sharedSubDirs = hasShared ? listTopLevelDirs(sharedDir) : [];
const featureDirs = topLevelDirs.filter((name) => name !== 'app-shell' && name !== 'shared');

/** @type {any[]} */
const importDirectionConfigs = [];

// app-shell: only app.routes.ts and app.component.ts may import it.
if (hasAppShell) {
  importDirectionConfigs.push({
    files: ['src/app/**/*.ts'],
    ignores: ['src/app/app.routes.ts', 'src/app/app.component.ts', 'src/app/app-shell/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/app-shell', '**/app-shell/**'],
              message: 'Only app.routes.ts and app.component.ts may import app-shell (ADR 005).',
            },
          ],
        },
      ],
    },
  });
}

// Features: a feature must never import another feature.
for (const feature of featureDirs) {
  const otherFeatures = featureDirs.filter((name) => name !== feature);
  if (otherFeatures.length === 0) continue;

  importDirectionConfigs.push({
    files: [`src/app/${feature}/**/*.ts`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: otherFeatures.map((other) => ({
            group: [`**/${other}`, `**/${other}/**`],
            message: `Feature "${feature}" must not import feature "${other}" (ADR 005). Cross-feature links go through router paths only.`,
          })),
        },
      ],
    },
  });
}

// shared/*: shared/design-system may be imported by any shared/* folder, but
// shared/* folders must not import each other. shared/design-system itself must
// not import anything from outside shared/design-system.
if (hasShared) {
  const otherSharedDirs = sharedSubDirs.filter((name) => name !== 'design-system');

  for (const sharedFolder of otherSharedDirs) {
    const otherShared = otherSharedDirs.filter((name) => name !== sharedFolder);
    if (otherShared.length === 0) continue;

    importDirectionConfigs.push({
      files: [`src/app/shared/${sharedFolder}/**/*.ts`],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: otherShared.map((other) => ({
              group: [`**/shared/${other}`, `**/shared/${other}/**`],
              message: `shared/${sharedFolder} must not import shared/${other} (ADR 005). Only shared/design-system may be imported by other shared/* folders.`,
            })),
          },
        ],
      },
    });
  }

  if (sharedSubDirs.includes('design-system')) {
    importDirectionConfigs.push({
      files: ['src/app/shared/design-system/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/app/**', '!**/shared/design-system/**'],
                message:
                  'shared/design-system must not import anything from outside shared/design-system (ADR 005).',
              },
            ],
          },
        ],
      },
    });
  }
}

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'joo',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'joo',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
  ...importDirectionConfigs,
  // eslint-config-prettier last, so it can turn off stylistic rules that
  // conflict with Prettier.
  eslintConfigPrettier,
]);
