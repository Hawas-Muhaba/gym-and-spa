import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StaffService } from '../../../core/services/staff.service';
import { ServiceCatalogService } from '../../../core/services/service-catalog.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ClientService } from '../../../core/services/client.service';
import { StaffListItem, TimeSlot } from '../../../core/models/staff.model';
import { ServiceItem } from '../../../core/models/service.model';
import { ClientListItem } from '../../../core/models/client.model';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.css',
})
export class BookingFormComponent implements OnInit {
  private staffService = inject(StaffService);
  private serviceCatalogService = inject(ServiceCatalogService);
  private appointmentService = inject(AppointmentService);
  private clientService = inject(ClientService);
  private snackBar = inject(MatSnackBar);

  staffList = signal<StaffListItem[]>([]);
  services = signal<ServiceItem[]>([]);
  timeSlots = signal<TimeSlot[]>([]);
  clients = signal<ClientListItem[]>([]);
  selectedClientId = new FormControl<number | null>(null);
  isSubmitting = signal(false);
  isLoadingSlots = signal(false);
  errorMessage = signal('');
  clientId = signal<number | null>(null);
  today = new Date().toISOString().slice(0, 10);

  // computed() — a signal that auto-recalculates whenever timeSlots changes, like a spreadsheet formula
  availableSlots = computed(() => this.timeSlots().filter(slot => slot.isAvailable));
  selectedService = computed(() => this.services().find(s => s.id === this.bookingForm.controls.serviceId.value));
  selectedStaff = computed(() => this.staffList().find(st => st.id === this.bookingForm.controls.staffId.value));

  bookingForm = new FormGroup({
    staffId: new FormControl<number | null>(null, Validators.required),
    serviceId: new FormControl<number | null>(null, Validators.required),
    date: new FormControl<string>(this.today, { nonNullable: true, validators: Validators.required }),
    startTime: new FormControl<string | null>(null, Validators.required),
  });

  ngOnInit() {
    this.clientService.getMyProfile().subscribe({
      next: profile => this.clientId.set(profile.id),
      error: () => {
        this.clientService.getAll(1, 100).subscribe(res => {
          this.clients.set(res.items);
          if (res.items.length > 0) {
            this.selectedClientId.setValue(res.items[0].id);
            this.clientId.set(res.items[0].id);
          }
        });
      },
    });

    this.selectedClientId.valueChanges.subscribe(id => {
      if (id) this.clientId.set(Number(id));
    });

    this.staffService.getAll().subscribe((staff) => this.staffList.set(staff));
    this.serviceCatalogService.getAll().subscribe((services) => this.services.set(services));

    // Staff and date together determine the live slot list.
    this.bookingForm.get('staffId')!.valueChanges.subscribe(() => this.refreshAvailability());
    this.bookingForm.get('date')!.valueChanges.subscribe(() => this.refreshAvailability());
  }

  private refreshAvailability() {
    const staffId = this.bookingForm.get('staffId')!.value;
    const date = this.bookingForm.get('date')!.value;
    if (!staffId || !date) {
      this.timeSlots.set([]);
      return;
    }

    this.isLoadingSlots.set(true);
    this.bookingForm.get('startTime')!.setValue(null);
    this.staffService.getAvailability(staffId, `${date}T00:00:00Z`).subscribe({
      next: slots => this.timeSlots.set(slots),
      error: () => this.timeSlots.set([]),
      complete: () => this.isLoadingSlots.set(false),
    });
  }

  onSubmit() {
    if (this.bookingForm.invalid || !this.clientId()) return;
    this.errorMessage.set('');
    this.isSubmitting.set(true);

    const raw = this.bookingForm.getRawValue();
    const startTimeUtc = new Date(raw.startTime!).toISOString();

    this.appointmentService.create({
      clientId: this.clientId()!,
      staffId: raw.staffId!,
      serviceId: raw.serviceId!,
      startTime: startTimeUtc,
    }).subscribe({
      next: () => {
        this.snackBar.open('Appointment booked!', 'Close', { duration: 3000 });
        this.bookingForm.patchValue({ serviceId: null, staffId: null, startTime: null, date: this.today });
        this.timeSlots.set([]);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        const conflict = err.status === 409 || err.status === 400;
        this.errorMessage.set(conflict ? 'Slot just taken, please select another.' : 'Booking failed. Please try again.');
        this.snackBar.open(this.errorMessage(), 'Close', { duration: 4500 });
        this.isSubmitting.set(false);
        this.refreshAvailability();
      }
    });
  }
}