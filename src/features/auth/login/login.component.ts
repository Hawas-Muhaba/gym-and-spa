import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStore } from '../../../core/stores/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private authStore = inject(AuthStore);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = false;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.errorMessage.set('');
    this.isLoading.set(true);

    const { email, password } = this.loginForm.getRawValue();

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (response) => {
        const user = this.authService.decodeToken(response.token.accessToken);
        this.authStore.setSession(response.token.accessToken, response.token.refreshToken, user);
        this.isLoading.set(false);

        // Route by role — Managers/Staff go to the dashboard, Clients to booking
        const destination = user.role === 'Client' ? '/book' : '/dashboard';
        this.router.navigate([destination]);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Invalid email or password. Please try again.');
      }
    });
  }
}