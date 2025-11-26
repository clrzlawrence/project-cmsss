import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface User {
  name: string;
  email: string;
  avatar: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Observable<any> {
    const valid = email === 'galvez@gmail.com' && password === 'admin';
    
    if (valid) {
      const user: User = {
        name: 'Galvez James',
        email: 'Galvez@gmail.com',
        avatar: 'https://scontent-mnl1-1.xx.fbcdn.net/v/t39.30808-1/224570019_4882169058494561_8380156668375777092_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=110&ccb=1-7&_nc_sid=1d2534&_nc_eui2=AeGig9udzX9Q7bCmIoKqkmzskld63bbbx1KSV3rdttvHUkDMPUxUecj_10BQkNPthUW_vrBVzge2eyP8D3QG6sRm&_nc_ohc=vysagaBbQLYQ7kNvwF5UO9S&_nc_oc=AdkXo6B0Sal7CXdExYYpYgfB6_ca_YfpCHMYPDQVo519LBzEKlzduvvm_5b9W9x4b0c&_nc_zt=24&_nc_ht=scontent-mnl1-1.xx&_nc_gid=Y7BgoqIvH2HiQ3N_601upg&oh=00_AfgfN-ZKs_EHhSK4zv_RB3rD-pBd5HcfxIhIO38ZXcoZLg&oe=691A01C5'
      };
      
      return of({ token: 'mock-token', user }).pipe(
        delay(200),
        tap(res => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        })
      );
    }
    
    return throwError(() => new Error('Incorrect email and/or password'));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/signin']); 
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}