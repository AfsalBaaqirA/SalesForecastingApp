import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (state.url == '/dashboard' || state.url == '/predict-data' || state.url == '/view-predictions') {
      if (this.authService.isLoggedIn()) {
        console.log('Logged in');
        return true;
      }
      else {
        this.router.navigate(['/login']);
        console.log('Not logged in');
        return false;
      }
    }
    else if (state.url == '/login') {
      if (this.authService.isLoggedIn()) {
        console.log('Logged in');
        this.router.navigate(['/dashboard']);
        return false;
      }
      else {
        console.log('Not logged in');
        return true;
      }
    }
    else if (state.url == '/home') {
      if (this.authService.isLoggedIn()) {
        console.log('Logged in');
        this.router.navigate(['/dashboard']);
        return false;
      }
      else {
        console.log('Not logged in');
        return true;
      }
    }
    return true;
  }
}