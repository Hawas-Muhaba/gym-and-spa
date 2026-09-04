import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { ClientService } from '../../../core/services/client.service';
import { ClientListItem } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush, // Lesson 6b — safe because everything here is signals
  imports: [MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatIconModule, MatChipsModule, ReactiveFormsModule, MatButtonModule],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css',
})
export class ClientListComponent implements OnInit {
  private clientService = inject(ClientService);
  private router = inject(Router);

  clients = signal<ClientListItem[]>([]);
  totalCount = signal(0);
  pageSize = signal(20);
  pageNumber = signal(1);
  searchControl = new FormControl('');

  displayedColumns = ['fullName', 'phone', 'membershipStatus', 'actions'];
  showCreateForm = signal(false);
  isCreating = signal(false);
  createError = signal('');
  createForm = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    phone: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    notes: new FormControl('', { nonNullable: true }),
  });

  ngOnInit() {
    this.loadClients();

    // Lesson 6b's debounceTime + switchMap pattern, now actually wired up
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => this.clientService.getAll(1, this.pageSize(), term ?? undefined))
    ).subscribe((result) => {
      this.clients.set(result.items);
      this.totalCount.set(result.totalCount);
      this.pageNumber.set(1);
    });
  }

  loadClients() {
    this.clientService.getAll(this.pageNumber(), this.pageSize(), this.searchControl.value ?? undefined)
      .subscribe((result) => {
        this.clients.set(result.items);
        this.totalCount.set(result.totalCount);
      });
  }

  onPageChange(event: PageEvent) {
    this.pageNumber.set(event.pageIndex + 1); // Material paginator is 0-indexed, your API is 1-indexed
    this.pageSize.set(event.pageSize);
    this.loadClients();
  }

  viewClient(id: number) {
    this.router.navigate(['/dashboard/clients', id]);
  }

  createClient() {
    if (this.createForm.invalid) return;
    this.isCreating.set(true);
    this.createError.set('');
    this.clientService.create(this.createForm.getRawValue()).subscribe({
      next: id => {
        this.isCreating.set(false);
        this.showCreateForm.set(false);
        this.createForm.reset();
        this.loadClients();
        this.router.navigate(['/dashboard/clients', id]);
      },
      error: () => {
        this.isCreating.set(false);
        this.createError.set('Could not create this client. Please check the details and try again.');
      },
    });
  }

  deleteClient(client: ClientListItem, event: Event) {
    event.stopPropagation();
    if (!confirm(`Are you sure you want to delete client "${client.fullName}"?`)) return;
    this.clientService.delete(client.id).subscribe({
      next: () => {
        this.loadClients();
      },
      error: () => {
        alert('Failed to delete client');
      },
    });
  }
}