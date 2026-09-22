import { ActivatedRouteSnapshot, BaseRouteReuseStrategy } from '@angular/router';

/**
 * Route reuse strategy for library document and folder routes.
 *
 * Reuses the component instance when navigating between library documents (`kind === 'doc'`)
 * or between library folders (`kind === 'folder'`). This allows `LibraryDocumentPage` and
 * `LibraryFolderPage` to stay mounted and update reactively from route data, avoiding
 * full DOM teardown and recreation.
 */
export class LibraryRouteReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    const futureKind = future.data?.['kind'];
    const currKind = curr.data?.['kind'];

    if (futureKind !== undefined && currKind !== undefined) {
      return futureKind === currKind;
    }

    return future.routeConfig === curr.routeConfig;
  }
}
