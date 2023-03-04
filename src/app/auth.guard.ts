import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  private allowNavigation = false;

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url = state.url;
    if (!this.allowNavigation && (url === '/queue' || url === '/search')) {
      this.router.navigateByUrl('/');
      return false;
    }
    this.allowNavigation = false;
    return true;
  }

  allowNavigationToQueue() {
    this.allowNavigation = true;
  }
}