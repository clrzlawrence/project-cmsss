import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // Header removed
  templateUrl: './signin.html',
  styleUrls: ['./signin.scss']
})
export class SigninComponent implements OnInit {
  isLoading = false;
  errorMessage: string | null = null;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = null;
      }
    });
  }

  onLogin(): void {
    this.isLoading = true;
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    const { email, password } = this.form.value;

    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/home']); 
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Incorrect email and/or password';
      }
    });
  }
}