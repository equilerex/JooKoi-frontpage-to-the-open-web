import { Routes } from '@angular/router';

/** Each tool is its own chunk. The index does not import `marked` or `mermaid`. */
export const toolsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tools.page').then((m) => m.ToolsPage),
    title: 'Tools',
  },
  {
    path: 'markdown',
    loadComponent: () => import('./markdown/markdown-tool.page').then((m) => m.MarkdownToolPage),
    title: 'Markdown',
  },
];
