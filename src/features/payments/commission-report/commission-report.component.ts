import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { StaffService } from '../../../core/services/staff.service';
import { PaymentService } from '../../../core/services/payment.service';
import { StaffListItem } from '../../../core/models/staff.model';
import { CommissionReport } from '../../../core/models/payment.model';

@Component({
  selector: 'app-commission-report',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './commission-report.component.html',
  styleUrls: ['./commission-report.component.css'],
})
export class CommissionReportComponent implements OnInit {
  private staffService = inject(StaffService);
  private paymentService = inject(PaymentService);
  staff = signal<StaffListItem[]>([]);
  selectedStaff = signal<number | null>(null);
  report = signal<CommissionReport | null>(null);
  range = signal<'week' | 'month' | 'custom'>('month');
  fromDate = signal(this.inputDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  toDate = signal(this.inputDate(new Date()));
  isLoading = signal(false);

  ngOnInit() {
    this.staffService.getAll().subscribe(list => {
      this.staff.set(list);
      if (list.length) { this.selectedStaff.set(list[0].id); this.loadReport(); }
    });
  }

  setRange(range: 'week' | 'month' | 'custom') {
    this.range.set(range);
    if (range !== 'custom') {
      const end = new Date();
      const start = new Date();
      if (range === 'week') start.setDate(end.getDate() - 6);
      else start.setDate(1);
      this.fromDate.set(this.inputDate(start));
      this.toDate.set(this.inputDate(end));
      this.loadReport();
    }
  }

  setStaff(value: string) { this.selectedStaff.set(Number(value)); this.loadReport(); }
  setFrom(value: string) { this.fromDate.set(value); if (this.range() === 'custom') this.loadReport(); }
  setTo(value: string) { this.toDate.set(value); if (this.range() === 'custom') this.loadReport(); }

  loadReport() {
    const staffId = this.selectedStaff();
    if (!staffId) return;
    this.isLoading.set(true);
    this.paymentService.getCommissionReport(staffId, `${this.fromDate()}T00:00:00`, `${this.toDate()}T23:59:59.999`).subscribe({
      next: result => { this.report.set(result); this.isLoading.set(false); },
      error: () => { this.report.set(null); this.isLoading.set(false); },
    });
  }

  deletePayment(paymentId: number) {
    if (!confirm('Are you sure you want to delete this payment record?')) return;
    this.paymentService.delete(paymentId).subscribe({
      next: () => {
        this.loadReport();
      },
      error: () => {
        alert('Failed to delete payment');
      },
    });
  }

  inputDate(value: Date) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`; }
}
