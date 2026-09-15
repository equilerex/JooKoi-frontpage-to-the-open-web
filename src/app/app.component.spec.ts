import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { page, userEvent } from 'vitest/browser';
import { routes } from './app.routes';

describe('AppComponent routing', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
  });

  it('renders the not-found page for an unknown route and navigates home via its link', async () => {
    const harness = await RouterTestingHarness.create('/does-not-exist');
    await harness.fixture.whenStable();

    const heading = page.getByRole('heading', { name: 'Page not found' });
    await expect.element(heading).toBeInTheDocument();

    const homeLink = page.getByRole('link', { name: 'Home' });
    await userEvent.click(homeLink);
    await harness.fixture.whenStable();

    const router = TestBed.inject(Router);
    expect(router.url).toBe('/');
  });
});
