import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  response: any;

  constructor(private http: HttpClient, private router: Router) { }

  isLoggedIn(): boolean {
    if (localStorage.getItem('isLoggedIn') == 'true') {
      return true;
    }
    else {
      return false;
    }
  }

  logout(): void {
    console.log('logging out');
    setTimeout(() => {
      this.http.post('http://192.168.1.96:5000/api/invalidate', { 'sessionToken': localStorage.getItem('sessionToken') }).subscribe((data) => {
        const response = JSON.parse(JSON.stringify(data));
        if (response['status']['status'] == 200) {
          console.log('invalidating');
          localStorage.removeItem('sessionToken');
          localStorage.setItem('isLoggedIn', 'false');
          this.router.navigate(['/home']);
        }
        else {
          console.log(response);
          this.router.navigate(['/home']);
        }
      });
    }, 2000);
  }

  validateToken(): void {
    this.http.post('http://192.168.1.96:5000/api/validate', { sessionToken: localStorage.getItem('sessionToken') }).subscribe((data) => {
      const response = JSON.parse(JSON.stringify(data));
      console.log(response);
      if (response['status']['status'] == 200) {
        if (response['status']['message'] == 'Valid') {
          localStorage.setItem('isLoggedIn', 'true');
        }
        else {
          localStorage.setItem('isLoggedIn', 'false');
          localStorage.removeItem('sessionToken');
          console.log('redirecting to login');
          this.router.navigate(['/login']);
        }
      }
      else {
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.removeItem('sessionToken');
        console.log('redirecting to login');
        this.router.navigate(['/login']);
      }
    });
  }
  login(sessionToken: string) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('sessionToken', sessionToken);
    console.log('redirecting to dashboard');
    this.router.navigate(['/dashboard']);
  }
}
