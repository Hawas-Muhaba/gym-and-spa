import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StaffListItem, StaffDetail, TimeSlot, CreateStaffRequest, UpdateStaffRequest } from '../models/staff.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StaffService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/staff`;

  getAll(): Observable<StaffListItem[]> {
    return this.http.get<StaffListItem[]>(this.baseUrl);
  }

  getById(id: number): Observable<StaffDetail> {
    return this.http.get<StaffDetail>(`${this.baseUrl}/${id}`);
  }

  getMyProfile(): Observable<{ id: number; fullName: string; phone: string; commissionRate: number }> {
    return this.http.get<{ id: number; fullName: string; phone: string; commissionRate: number }>(`${this.baseUrl}/me`);
  }

  getAvailability(staffId: number, date: string): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(`${this.baseUrl}/${staffId}/availability`, { params: { date } });
  }

  create(request: CreateStaffRequest): Observable<number> {
    return this.http.post<number>(this.baseUrl, request);
  }

  update(id: number, request: UpdateStaffRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}