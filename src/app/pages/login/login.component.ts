import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  loginError = false;
  isAdminMode = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // If already logged in, go straight to dashboard
    if (this.authService.currentUserValue) {
      this.router.navigate(['/dashboard']);
    }

    this.loginForm = this.fb.group({
      idNumber: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  toggleMode(): void {
    this.isAdminMode = !this.isAdminMode;
    this.loginError = false;
    this.loginForm.reset();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginError = false;

    const { idNumber, password } = this.loginForm.value;

    this.authService.login(idNumber, password).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          const user = this.authService.currentUserValue;
          if (user?.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        } else {
          this.loginError = true;
        }
      },
      error: () => {
        this.isLoading = false;
        this.loginError = true;
      }
    });
  }
}

