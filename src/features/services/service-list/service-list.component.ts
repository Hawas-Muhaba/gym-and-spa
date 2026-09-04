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
import { ServiceCatalogService } from '../../../core/services/service-catalog.service';
import { ServiceItem } from '../../../core/models/service.model';

@Component({
  selector: 'app-service-list',
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
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.css'],
})
export class ServiceListComponent implements OnInit {
  private serviceCatalog = inject(ServiceCatalogService);
  private snackBar = inject(MatSnackBar);

  services = signal<ServiceItem[]>([]);
  isLoading = signal(false);
  showForm = signal(false);

  displayedColumns = ['name', 'durationMinutes', 'price', 'actions'];

  serviceForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    durationMinutes: new FormControl<number>(60, { nonNullable: true, validators: [Validators.required, Validators.min(5)] }),
    price: new FormControl<number>(500, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
  });

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.isLoading.set(true);
    this.serviceCatalog.getAll().subscribe({
      next: (data) => {
        this.services.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load services', 'Close', { duration: 3000 });
      },
    });
  }

  openCreate() {
    this.serviceForm.reset({ name: '', durationMinutes: 60, price: 500 });
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
    this.serviceForm.reset();
  }

  saveService() {
    if (this.serviceForm.invalid) return;

    this.serviceCatalog.create(this.serviceForm.getRawValue()).subscribe({
      next: () => {
        this.snackBar.open('Service added successfully', 'Close', { duration: 3000 });
        this.cancelForm();
        this.loadServices();
      },
      error: () => this.snackBar.open('Failed to create service', 'Close', { duration: 3000 }),
    });
  }

  deleteService(service: ServiceItem) {
    if (!confirm(`Are you sure you want to delete service "${service.name}"?`)) return;

    this.serviceCatalog.delete(service.id).subscribe({
      next: () => {
        this.snackBar.open('Service deleted successfully', 'Close', { duration: 3000 });
        this.loadServices();
      },
      error: () => this.snackBar.open('Failed to delete service', 'Close', { duration: 3000 }),
    });
  }
}
