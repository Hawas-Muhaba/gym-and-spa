import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommissionReport, RecordPaymentRequest } from '../models/payment.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/payments`;

  recordPayment(request: RecordPaymentRequest): Observable<number> {
    return this.http.post<number>(this.baseUrl, request);
  }

  getCommissionReport(staffId: number, fromDate: string, toDate: string): Observable<CommissionReport> {
    const params = new HttpParams().set('fromDate', fromDate).set('toDate', toDate);
    return this.http.get<CommissionReport>(`${this.baseUrl}/staff/${staffId}/commission-report`, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
