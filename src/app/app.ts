import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from '../core/stores/auth.store';
import { AuthService } from '../core/services/auth.service';

// Gym Management System - Main App Component
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private authStore = inject(AuthStore);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    // Restore token from sessionStorage so guards work on page refresh
    if (!isPlatformBrowser(this.platformId)) return;

    const accessToken = sessionStorage.getItem('gym_access_token');
    const refreshToken = sessionStorage.getItem('gym_refresh_token');
    if (accessToken && refreshToken) {
      const user = this.authService.decodeToken(accessToken);
      this.authStore.setSession(accessToken, refreshToken, user);
    }
  }
}
