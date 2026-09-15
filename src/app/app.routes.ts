import { Routes } from '@angular/router';
import { NotFoundPage } from './app-shell/not-found.page';

export const routes: Routes = [{ path: '**', component: NotFoundPage }];
