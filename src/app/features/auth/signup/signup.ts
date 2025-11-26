import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class SignupComponent {
loginForm: FormGroup;
authError = '';
isSubmitted = false;

constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
  this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
}

onLogin(): void {
  this.authError = '';
  this.isSubmitted = true;
  console.log('email', this.loginForm.value.email);
  console.log('password', this.loginForm.value.password);
  this.router.navigate(['/signin']);
  
  
  if (this.loginForm.invalid) {
    this.markFormGroupTouched(this.loginForm);
    return;
  }
  
  const { email, password } = this.loginForm.value;
  this.auth.login(email, password).subscribe({
    next: () => this.router.navigate(['/signin']),
    error: () => this.authError = 'Incorrect email or password'
  });
}

private markFormGroupTouched(formGroup: FormGroup): void {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    control?.markAsTouched();
    control?.markAsDirty();
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  
}