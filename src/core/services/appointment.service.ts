import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateAppointmentRequest, AppointmentListItem, AppointmentDetail, ScheduleItem } from '../models/appointment.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/appointments`;

  create(request: CreateAppointmentRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, request);
  }

  getById(id: number): Observable<AppointmentDetail> {
    return this.http.get<AppointmentDetail>(`${this.baseUrl}/${id}`);
  }

  getByClient(clientId: number): Observable<AppointmentListItem[]> {
    return this.http.get<AppointmentListItem[]>(`${this.baseUrl}/client/${clientId}`);
  }

  getStaffSchedule(staffId: number, date: string): Observable<ScheduleItem[]> {
    return this.http.get<ScheduleItem[]>(`${this.baseUrl}/staff/${staffId}/schedule`, { params: { date } });
  }

  cancel(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/cancel`, {});
  }

  updateStatus(id: number, status: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/status`, status);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}