import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
  routesToCache: string[] = [];
  storedRouteHandles = new Map<string, DetachedRouteHandle>();

  // Determines if this route (and its subtree) should be detached to be reused later
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return this.routesToCache.indexOf(this.getPath(route)) > -1;
  }

  // Stores the detached route.
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    this.storedRouteHandles.set(this.getPath(route), handle);
  }

  // Determines if this route (and its subtree) should be reattached
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.storedRouteHandles.has(this.getPath(route));
  }

  // Retrieves the previously stored route
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    return this.storedRouteHandles.get(this.getPath(route)) as DetachedRouteHandle;
  }

  // Determines if a route should be reused
  shouldReuseRoute(next: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // return next.routeConfig === curr.routeConfig && curr.component !== UserDetailsComponent;
    // console.log(curr.data, next.data);
    return next.routeConfig === curr.routeConfig && (curr.data['reuse'] !== false);
  }

  private getPath(route: ActivatedRouteSnapshot): string {
    return (route.routeConfig != null && route.routeConfig.path != null) 
      ? route.routeConfig.path
      : '';
  }
}
