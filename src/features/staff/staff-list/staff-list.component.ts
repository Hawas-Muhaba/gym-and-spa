import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StaffService } from '../../../core/services/staff.service';
import { StaffListItem, StaffDetail } from '../../../core/models/staff.model';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSnackBarModule,
  ],
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.css'],
})
export class StaffListComponent implements OnInit {
  private staffService = inject(StaffService);
  private snackBar = inject(MatSnackBar);

  staffList = signal<StaffListItem[]>([]);
  isLoading = signal(false);
  selectedStaff = signal<StaffDetail | null>(null);
  editingStaffId = signal<number | null>(null);
  showForm = signal(false);

  displayedColumns = ['fullName', 'phone', 'commissionRate', 'actions'];

  staffForm = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    commissionRate: new FormControl<number>(0.1, { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.max(1)] }),
  });

  ngOnInit() {
    this.loadStaff();
  }

  loadStaff() {
    this.isLoading.set(true);
    this.staffService.getAll().subscribe({
      next: (list) => {
        this.staffList.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load staff list', 'Close', { duration: 3000 });
      },
    });
  }

  openCreate() {
    this.editingStaffId.set(null);
    this.staffForm.reset({ fullName: '', phone: '', commissionRate: 0.1 });
    this.showForm.set(true);
  }

  editStaff(staff: StaffListItem) {
    this.editingStaffId.set(staff.id);
    this.staffForm.patchValue({
      fullName: staff.fullName,
      phone: staff.phone,
      commissionRate: staff.commissionRate,
    });
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
    this.editingStaffId.set(null);
    this.staffForm.reset();
  }

  viewDetails(id: number) {
    this.staffService.getById(id).subscribe({
      next: (detail) => this.selectedStaff.set(detail),
      error: () => this.snackBar.open('Failed to load staff details', 'Close', { duration: 3000 }),
    });
  }

  closeDetails() {
    this.selectedStaff.set(null);
  }

  saveStaff() {
    if (this.staffForm.invalid) return;
    const formVal = this.staffForm.getRawValue();

    const editingId = this.editingStaffId();
    if (editingId !== null) {
      this.staffService.update(editingId, formVal).subscribe({
        next: () => {
          this.snackBar.open('Staff member updated successfully', 'Close', { duration: 3000 });
          this.cancelForm();
          this.loadStaff();
        },
        error: () => this.snackBar.open('Failed to update staff member', 'Close', { duration: 3000 }),
      });
    } else {
      this.staffService.create(formVal).subscribe({
        next: () => {
          this.snackBar.open('Staff member added successfully', 'Close', { duration: 3000 });
          this.cancelForm();
          this.loadStaff();
        },
        error: () => this.snackBar.open('Failed to create staff member', 'Close', { duration: 3000 }),
      });
    }
  }

  deleteStaff(staff: StaffListItem) {
    if (!confirm(`Are you sure you want to remove staff member "${staff.fullName}"?`)) return;

    this.staffService.delete(staff.id).subscribe({
      next: () => {
        this.snackBar.open('Staff member removed successfully', 'Close', { duration: 3000 });
        if (this.selectedStaff()?.id === staff.id) {
          this.selectedStaff.set(null);
        }
        this.loadStaff();
      },
      error: () => this.snackBar.open('Failed to delete staff member', 'Close', { duration: 3000 }),
    });
  }
}
