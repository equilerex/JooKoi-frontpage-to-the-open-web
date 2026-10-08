import { Routes } from '@angular/router';

/**
 * `/calendar-sync` (application home page) and `/calendar-sync/privacy` (privacy policy),
 * linked from the Google OAuth consent screen branding. Static copy, prerendered.
 */
export const calendarSyncRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./calendar-sync.page').then((m) => m.CalendarSyncPage),
    title: 'Calendar sync',
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./calendar-sync-privacy.page').then((m) => m.CalendarSyncPrivacyPage),
    title: 'Privacy policy',
  },
];
