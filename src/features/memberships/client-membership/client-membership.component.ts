import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { ClientService } from '../../../core/services/client.service';
import { MembershipService } from '../../../core/services/membership.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Membership } from '../../../core/models/membership.model';
import { AppointmentListItem } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-client-membership',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
  ],
  templateUrl: './client-membership.component.html',
  styleUrls: ['./client-membership.component.css'],
})
export class ClientMembershipComponent implements OnInit {
  private clientService = inject(ClientService);
  private membershipService = inject(MembershipService);
  private appointmentService = inject(AppointmentService);

  clientProfile = signal<{ id: number; fullName: string; phone: string; email: string } | null>(null);
  membership = signal<Membership | null>(null);
  appointments = signal<AppointmentListItem[]>([]);
  isLoading = signal(true);

  displayedColumns = ['serviceName', 'staffName', 'startTime', 'status'];

  daysRemaining = computed(() => {
    const m = this.membership();
    if (!m || !m.expiryDate) return 0;
    const diff = new Date(m.expiryDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  });

  ngOnInit() {
    this.clientService.getMyProfile().subscribe({
      next: (profile) => {
        this.clientProfile.set(profile);
        this.loadMembership(profile.id);
        this.loadAppointments(profile.id);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private loadMembership(clientId: number) {
    this.membershipService.getByClient(clientId).subscribe({
      next: (mem) => {
        this.membership.set(mem);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private loadAppointments(clientId: number) {
    this.appointmentService.getByClient(clientId).subscribe({
      next: (list) => this.appointments.set(list),
      error: () => {},
    });
  }
}
