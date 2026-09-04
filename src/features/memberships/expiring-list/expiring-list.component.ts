import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MembershipService } from '../../../core/services/membership.service';
import { ExpiringMembership } from '../../../core/models/membership.model';

@Component({
  selector: 'app-expiring-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatTableModule, MatButtonModule, MatIconModule, MatSliderModule, MatSnackBarModule],
  templateUrl: './expiring-list.component.html',
  styleUrl: './expiring-list.component.css',
})
export class ExpiringListComponent implements OnInit {
  private membershipService = inject(MembershipService);
  private snackBar = inject(MatSnackBar);

  expiring = signal<ExpiringMembership[]>([]);
  displayedColumns = ['clientName', 'phone', 'expiryDate', 'reminder', 'actions'];
  withinDays = signal(7);
  renewingClient = signal<number | null>(null);

  ngOnInit() {
    this.loadExpiring();
  }

  loadExpiring() {
    this.membershipService.getExpiringSoon(this.withinDays()).subscribe((list) => this.expiring.set(list));
  }

  setWindow(value: number | null) {
    this.withinDays.set(value ?? 7);
    this.loadExpiring();
  }

  renew(clientId: number) {
    this.renewingClient.set(clientId);
    this.membershipService.renew({ clientId, durationMonths: 1 }).subscribe(() => {
      this.renewingClient.set(null);
      this.snackBar.open('Membership renewed for one month.', 'Close', { duration: 3500 });
      this.loadExpiring();
    }, () => {
      this.renewingClient.set(null);
      this.snackBar.open('Renewal failed. Please try again.', 'Close', { duration: 4000 });
    });
  }
}