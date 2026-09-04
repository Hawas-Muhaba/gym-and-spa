import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientService } from '../../../core/services/client.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { MembershipService } from '../../../core/services/membership.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ClientDetail } from '../../../core/models/client.model';
import { AppointmentListItem, AppointmentDetail } from '../../../core/models/appointment.model';
import { Membership } from '../../../core/models/membership.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.css'],
})
export class ClientDetailComponent implements OnInit {
  private clientService = inject(ClientService);
  private appointmentService = inject(AppointmentService);
  private membershipService = inject(MembershipService);
  private paymentService = inject(PaymentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  clientId = signal<number | null>(null);
  client = signal<ClientDetail | null>(null);
  appointments = signal<AppointmentListItem[]>([]);
  membership = signal<Membership | null>(null);
  selectedAppointment = signal<AppointmentDetail | null>(null);

  isLoading = signal(true);
  isSavingNotes = signal(false);
  isRenewing = signal(false);

  payingAppointmentId = signal<number | null>(null);
  paymentAmountControl = new FormControl<number>(500, { nonNullable: true, validators: [Validators.required, Validators.min(1)] });

  statusOptions: ('Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'NoShow')[] = [
    'Pending', 'Confirmed', 'Cancelled', 'Completed', 'NoShow'
  ];

  appointmentColumns = ['id', 'serviceName', 'staffName', 'startTime', 'status', 'actions'];

  profileForm = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    notes: new FormControl('', { nonNullable: true }),
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      this.clientId.set(id);
      this.loadAllData(id);
    }
  }

  loadAllData(id: number) {
    this.isLoading.set(true);
    this.clientService.getById(id).subscribe({
      next: (data) => {
        this.client.set(data);
        this.profileForm.patchValue({
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          notes: data.notes ?? '',
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Client not found', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/clients']);
      },
    });

    this.loadAppointments(id);
    this.loadMembership(id);
  }

  loadAppointments(id: number) {
    this.appointmentService.getByClient(id).subscribe({
      next: (list) => this.appointments.set(list),
      error: () => {},
    });
  }

  loadMembership(id: number) {
    this.membershipService.getByClient(id).subscribe({
      next: (mem) => this.membership.set(mem),
      error: () => {},
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/clients']);
  }

  saveProfile() {
    const id = this.clientId();
    if (!id || this.profileForm.invalid) return;

    this.isSavingNotes.set(true);
    const formVal = this.profileForm.getRawValue();
    this.clientService.update(id, formVal).subscribe({
      next: () => {
        this.isSavingNotes.set(false);
        this.snackBar.open('Client updated successfully', 'Close', { duration: 3000 });
        this.loadAllData(id);
      },
      error: () => {
        this.isSavingNotes.set(false);
        this.snackBar.open('Failed to update client', 'Close', { duration: 3000 });
      },
    });
  }

  deleteClient() {
    const c = this.client();
    if (!c) return;
    if (!confirm(`Are you sure you want to completely delete client "${c.fullName}"? This cannot be undone.`)) return;

    this.clientService.delete(c.id).subscribe({
      next: () => {
        this.snackBar.open('Client deleted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/clients']);
      },
      error: () => this.snackBar.open('Failed to delete client', 'Close', { duration: 3000 }),
    });
  }

  viewAppointmentDetail(id: number) {
    this.appointmentService.getById(id).subscribe({
      next: (detail) => this.selectedAppointment.set(detail),
      error: () => this.snackBar.open('Could not load appointment details', 'Close', { duration: 3000 }),
    });
  }

  closeAppointmentDetail() {
    this.selectedAppointment.set(null);
  }

  statusValue(status: string): number {
    const map: Record<string, number> = { Pending: 0, Confirmed: 1, Cancelled: 2, Completed: 3, NoShow: 4 };
    return map[status] ?? 0;
  }

  changeStatus(appointmentId: number, newStatusStr: string) {
    const val = this.statusValue(newStatusStr);
    this.appointmentService.updateStatus(appointmentId, val).subscribe({
      next: () => {
        this.snackBar.open(`Status updated to ${newStatusStr}`, 'Close', { duration: 3000 });
        const cId = this.clientId();
        if (cId) this.loadAppointments(cId);
      },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 3000 }),
    });
  }

  cancelAppointment(id: number) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    this.appointmentService.cancel(id).subscribe({
      next: () => {
        this.snackBar.open('Appointment cancelled', 'Close', { duration: 3000 });
        const cId = this.clientId();
        if (cId) this.loadAppointments(cId);
      },
      error: () => this.snackBar.open('Failed to cancel appointment', 'Close', { duration: 3000 }),
    });
  }

  deleteAppointment(id: number) {
    if (!confirm('Are you sure you want to permanently delete this appointment record?')) return;
    this.appointmentService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Appointment deleted', 'Close', { duration: 3000 });
        if (this.selectedAppointment()?.id === id) {
          this.selectedAppointment.set(null);
        }
        const cId = this.clientId();
        if (cId) this.loadAppointments(cId);
      },
      error: () => this.snackBar.open('Failed to delete appointment', 'Close', { duration: 3000 }),
    });
  }

  openPayment(appointmentId: number) {
    this.payingAppointmentId.set(appointmentId);
  }

  cancelPayment() {
    this.payingAppointmentId.set(null);
  }

  submitPayment(appointmentId: number) {
    const amount = this.paymentAmountControl.value;
    if (!amount || amount <= 0) return;

    this.paymentService.recordPayment({ appointmentId, amount }).subscribe({
      next: () => {
        this.snackBar.open(`Payment of ${amount} ETB recorded!`, 'Close', { duration: 3000 });
        this.payingAppointmentId.set(null);
        const cId = this.clientId();
        if (cId) this.loadAppointments(cId);
      },
      error: () => this.snackBar.open('Failed to record payment', 'Close', { duration: 3000 }),
    });
  }

  renewMembership(durationMonths = 1) {
    const id = this.clientId();
    if (!id) return;
    this.isRenewing.set(true);
    this.membershipService.renew({ clientId: id, durationMonths }).subscribe({
      next: () => {
        this.isRenewing.set(false);
        this.snackBar.open(`Membership renewed for ${durationMonths} month(s)!`, 'Close', { duration: 3000 });
        this.loadMembership(id);
      },
      error: () => {
        this.isRenewing.set(false);
        this.snackBar.open('Renewal failed', 'Close', { duration: 3000 });
      },
    });
  }

  deleteMembership(membershipId: number) {
    if (!confirm('Are you sure you want to delete/revoke this membership?')) return;
    this.membershipService.delete(membershipId).subscribe({
      next: () => {
        this.snackBar.open('Membership removed', 'Close', { duration: 3000 });
        const cId = this.clientId();
        if (cId) this.loadMembership(cId);
      },
      error: () => this.snackBar.open('Failed to remove membership', 'Close', { duration: 3000 }),
    });
  }
}
