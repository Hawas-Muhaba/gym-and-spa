import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthStore } from '../../../core/stores/auth.store';
import { StaffService } from '../../../core/services/staff.service';
import { SignalrService } from '../../../core/services/signalr.service';

export interface NotificationItem {
  id: number;
  message: string;
  time: Date;
}

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatSnackBarModule],
  templateUrl: './dashboard-shell.html',
  styleUrl: './dashboard-shell.css',
})
export class DashboardShell implements OnInit {
  private authStore = inject(AuthStore);
  private staffService = inject(StaffService);
  private router = inject(Router);
  private signalrService = inject(SignalrService);
  private snackBar = inject(MatSnackBar);

  user = this.authStore.user;
  staffName = signal<string | null>(null);
  role = computed(() => this.user()?.role ?? 'Client');
  displayName = computed(() => this.staffName() || this.user()?.email?.split('@')[0] || 'Member');

  notifications = signal<NotificationItem[]>([]);
  unreadCount = signal<number>(0);
  showNotifications = signal<boolean>(false);

  constructor() {
    effect(() => {
      const booking = this.signalrService.newBooking();
      if (booking) {
        const timeStr = new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const msg = `New booking: ${booking.clientName} booked ${booking.serviceName} at ${timeStr}`;
        this.snackBar.open(msg, 'View', { duration: 6000 });
        this.notifications.update((list) => [
          { id: Date.now(), message: msg, time: new Date() },
          ...list.slice(0, 9),
        ]);
        this.unreadCount.update((c) => c + 1);
      }
    });
  }

  ngOnInit() {
    if (this.role() !== 'Client') {
      this.staffService.getMyProfile().subscribe({
        next: (profile) => {
          this.staffName.set(profile.fullName);
          const token = this.authStore.accessToken();
          if (token) this.signalrService.connect(profile.id, token);
        },
        error: () => {},
      });
    }
  }

  toggleNotifications() {
    this.showNotifications.update((s) => !s);
    if (this.showNotifications()) {
      this.unreadCount.set(0);
    }
  }

  logout() {
    this.signalrService.disconnect();
    this.authStore.logout();
    this.router.navigate(['/login']);
  }
}
