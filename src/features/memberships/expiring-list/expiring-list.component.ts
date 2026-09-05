import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MembershipService } from '../../../core/services/membership.service';
import { ClientService } from '../../../core/services/client.service';
import { ExpiringMembership } from '../../../core/models/membership.model';
import { ClientListItem } from '../../../core/models/client.model';

@Component({
  selector: 'app-expiring-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatSnackBarModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './expiring-list.component.html',
  styleUrl: './expiring-list.component.css',
})
export class ExpiringListComponent implements OnInit {
  private membershipService = inject(MembershipService);
  private clientService = inject(ClientService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  expiring = signal<ExpiringMembership[]>([]);
  allClients = signal<ClientListItem[]>([]);
  isLoadingClients = signal(false);
  displayedColumns = ['clientName', 'phone', 'expiryDate', 'reminder', 'actions'];
  clientColumns = ['fullName', 'phone', 'status', 'actions'];

  withinDays = signal(7);
  renewingClient = signal<number | null>(null);
  showAssignDialog = signal(false);
  isAssigning = signal(false);

  assignForm = new FormGroup({
    clientId: new FormControl<number | null>(null, Validators.required),
    durationMonths: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
  });

  ngOnInit() {
    this.loadExpiring();
    this.loadAllClients();
  }

  loadExpiring() {
    this.membershipService.getExpiringSoon(this.withinDays()).subscribe({
      next: (list) => this.expiring.set(list),
      error: () => {},
    });
  }

  loadAllClients() {
    this.isLoadingClients.set(true);
    this.clientService.getAll(1, 100).subscribe({
      next: (res) => {
        this.allClients.set(res.items);
        this.isLoadingClients.set(false);
      },
      error: () => this.isLoadingClients.set(false),
    });
  }

  setWindow(value: number | null) {
    this.withinDays.set(value ?? 7);
    this.loadExpiring();
  }

  openAssignModal(clientId?: number) {
    if (clientId) {
      this.assignForm.patchValue({ clientId, durationMonths: 1 });
    } else {
      this.assignForm.reset({ clientId: null, durationMonths: 1 });
    }
    this.showAssignDialog.set(true);
  }

  closeAssignModal() {
    this.showAssignDialog.set(false);
    this.assignForm.reset({ clientId: null, durationMonths: 1 });
  }

  submitAssign() {
    if (this.assignForm.invalid) return;
    const { clientId, durationMonths } = this.assignForm.getRawValue();
    if (!clientId || !durationMonths) return;

    this.isAssigning.set(true);
    this.membershipService.renew({ clientId, durationMonths }).subscribe({
      next: () => {
        this.isAssigning.set(false);
        this.snackBar.open(`Membership activated/extended for ${durationMonths} month(s)!`, 'Close', { duration: 4000 });
        this.closeAssignModal();
        this.loadExpiring();
        this.loadAllClients();
      },
      error: () => {
        this.isAssigning.set(false);
        this.snackBar.open('Failed to update membership.', 'Close', { duration: 4000 });
      },
    });
  }

  renew(clientId: number, durationMonths = 1) {
    this.renewingClient.set(clientId);
    this.membershipService.renew({ clientId, durationMonths }).subscribe({
      next: () => {
        this.renewingClient.set(null);
        this.snackBar.open(`Membership renewed for ${durationMonths} month(s).`, 'Close', { duration: 3500 });
        this.loadExpiring();
        this.loadAllClients();
      },
      error: () => {
        this.renewingClient.set(null);
        this.snackBar.open('Renewal failed. Please try again.', 'Close', { duration: 4000 });
      },
    });
  }

  viewClient(clientId: number) {
    this.router.navigate(['/dashboard/clients', clientId]);
  }
}