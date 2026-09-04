import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpiringMembership, RenewMembershipRequest, Membership } from '../models/membership.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MembershipService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/memberships`;

  renew(request: RenewMembershipRequest): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/renew`, request);
  }

  getByClient(clientId: number): Observable<Membership | null> {
    return this.http.get<Membership | null>(`${this.baseUrl}/client/${clientId}`);
  }

  getExpiringSoon(withinDays = 7): Observable<ExpiringMembership[]> {
    return this.http.get<ExpiringMembership[]>(`${this.baseUrl}/expiring-soon`, { params: { withinDays } });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}