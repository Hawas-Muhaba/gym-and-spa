import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = false;

  registerForm = new FormGroup({
    fullName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    phone: new FormControl('', Validators.required),
    role: new FormControl('Client', Validators.required),
  });

  roles = ['Client', 'Staff', 'Manager'];

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);

    const formValue = this.registerForm.getRawValue();

    this.authService.register({
      fullName: formValue.fullName!,
      email: formValue.email!,
      password: formValue.password!,
      phone: formValue.phone!,
      role: formValue.role as 'Client' | 'Staff' | 'Manager',
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Account created! Redirecting to sign in…');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.error?.detail || error?.error?.message || 'Registration failed. Please try again.'
        );
      },
    });
  }
}
