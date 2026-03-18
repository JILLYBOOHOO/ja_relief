import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface User {
  idNumber: string;
  name: string;
  role: 'survivor' | 'admin' | 'agent';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check local storage for initial state
    const savedUser = localStorage.getItem('survivor_user');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  // Returns currently logged in user synchronously
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Simulated login - replace with real API call later
  login(idNumber: string, password: string): Observable<boolean> {
    // Basic mock logic: any login works for now to test flow
    if (idNumber === 'admin' && password === 'admin123') {
      const adminUser: User = { idNumber: 'admin', name: 'Admin Agent', role: 'admin' };
      localStorage.setItem('survivor_user', JSON.stringify(adminUser));
      this.currentUserSubject.next(adminUser);
      return of(true).pipe(delay(500));
    }

    if (idNumber && password) {
      const mockUser: User = { idNumber: idNumber, name: 'John Doe', role: 'survivor' };
      localStorage.setItem('survivor_user', JSON.stringify(mockUser));
      this.currentUserSubject.next(mockUser);
      return of(true).pipe(delay(500));
    }
    return of(false).pipe(delay(500));
  }

  logout(): void {
    localStorage.removeItem('survivor_user');
    this.currentUserSubject.next(null);
  }

  updateUser(updatedData: Partial<User>): void {
    const current = this.currentUserSubject.value;
    if (current) {
      const newUser = { ...current, ...updatedData };
      localStorage.setItem('survivor_user', JSON.stringify(newUser));
      this.currentUserSubject.next(newUser);
    }
  }
}

