import { Routes } from '@angular/router';
import { HomePage } from './app-shell/home.page';
import { NotFoundPage } from './app-shell/not-found.page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: '**', component: NotFoundPage },
];
