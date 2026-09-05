import { Component, inject, signal, OnInit, effect, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AppointmentService } from '../../../core/services/appointment.service';
import { SignalrService } from '../../../core/services/signalr.service';
import { AuthStore } from '../../../core/stores/auth.store';
import { BookingStatus, ScheduleItem } from '../../../core/models/appointment.model';
import { StaffListItem } from '../../../core/models/staff.model';
import { StaffService } from '../../../core/services/staff.service';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
  selector: 'app-staff-schedule',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './staff-schedule.component.html',
  styleUrl: './staff-schedule.component.css',
})
export class StaffScheduleComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private signalrService = inject(SignalrService);
  private authStore = inject(AuthStore);
  private staffService = inject(StaffService);
  private paymentService = inject(PaymentService);

  schedule = signal<ScheduleItem[]>([]);
  staffList = signal<StaffListItem[]>([]);
  date = signal(this.toDateInput(new Date()));
  staffId = signal<number | null>(null);
  isManager = this.authStore.user()?.role === 'Manager';
  isUpdating = signal<number | null>(null);
  statusOptions = ['Pending', 'Confirmed', 'Completed', 'NoShow', 'Cancelled'] as const;
  visibleSchedule = computed(() => this.schedule().slice().sort((a, b) => a.startTime.localeCompare(b.startTime)));
  paymentItem = signal<ScheduleItem | null>(null);
  paymentAmount = signal(0);
  isRecordingPayment = signal(false);
  paymentError = signal('');
  commissionPreview = computed(() => this.paymentAmount() * (this.paymentItem()?.commissionRate ?? 0));

  constructor() {
    // effect() runs automatically whenever any signal it reads changes — here, reacting to live SignalR pushes
    effect(() => {
      const newBooking = this.signalrService.newBooking();
      if (newBooking) {
        this.schedule.update((current) => [...current, newBooking].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)));
      }
    });
  }

  ngOnInit() {
    this.staffService.getMyProfile().subscribe({
      next: profile => {
        if (!this.isManager) this.staffId.set(profile.id);
        this.loadSchedule();
      },
    });
    if (this.isManager) {
      this.staffService.getAll().subscribe(staff => {
        this.staffList.set(staff);
        if (staff.length) this.staffId.set(staff[0].id);
        this.loadSchedule();
      });
    }
  }

  loadSchedule() {
    const id = this.staffId();
    if (!id) return;

    this.appointmentService.getStaffSchedule(id, `${this.date()}T00:00:00`).subscribe((items) => {
      this.schedule.set(items);
    });
  }

  setDate(value: string) {
    this.date.set(value);
    this.loadSchedule();
  }

  setToday() {
    this.setDate(this.toDateInput(new Date()));
  }

  shiftDate(days: number) {
    const next = new Date(`${this.date()}T12:00:00`);
    next.setDate(next.getDate() + days);
    this.setDate(this.toDateInput(next));
  }

  setStaff(value: string) {
    this.staffId.set(Number(value));
    this.loadSchedule();
  }

  statusValue(status: string) {
    return { Pending: 0, Confirmed: 1, Cancelled: 2, Completed: 3, NoShow: 4 }[status as typeof this.statusOptions[number]] ?? -1;
  }

  updateStatus(item: ScheduleItem, status: string) {
    const nextStatus = this.statusValue(status);
    if (nextStatus < 0 || status === item.status) return;
    this.isUpdating.set(item.appointmentId);
    this.appointmentService.updateStatus(item.appointmentId, nextStatus).subscribe({
      next: () => {
        this.schedule.update(items => items.map(current => current.appointmentId === item.appointmentId ? { ...current, status: status as BookingStatus } : current));
        this.isUpdating.set(null);
      },
      error: () => this.isUpdating.set(null),
    });
  }

  cancel(item: ScheduleItem) {
    if (!window.confirm(`Cancel ${item.serviceName} for ${item.clientName}?`)) return;
    this.isUpdating.set(item.appointmentId);
    this.appointmentService.cancel(item.appointmentId).subscribe({
      next: () => {
        this.schedule.update(items => items.map(current => current.appointmentId === item.appointmentId ? { ...current, status: 'Cancelled' } : current));
        this.isUpdating.set(null);
      },
      error: () => this.isUpdating.set(null),
    });
  }

  openPayment(item: ScheduleItem) {
    this.paymentItem.set(item);
    this.paymentAmount.set(item.servicePrice ?? 0);
    this.paymentError.set('');
  }

  closePayment() { this.paymentItem.set(null); }

  setPaymentAmount(value: string) { this.paymentAmount.set(Number(value) || 0); }

  recordPayment() {
    const item = this.paymentItem();
    if (!item || this.paymentAmount() <= 0) return;
    this.isRecordingPayment.set(true);
    this.paymentError.set('');
    this.paymentService.recordPayment({ appointmentId: item.appointmentId, amount: this.paymentAmount() }).subscribe({
      next: () => {
        this.isRecordingPayment.set(false);
        this.schedule.update(items => items.map(curr => curr.appointmentId === item.appointmentId ? { ...curr, status: 'Completed' as BookingStatus } : curr));
        this.closePayment();
      },
      error: () => {
        this.isRecordingPayment.set(false);
        this.paymentError.set('Payment could not be recorded. Please try again.');
      },
    });
  }

  toDateInput(value: Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }

}