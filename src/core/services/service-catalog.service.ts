import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceItem, CreateServiceRequest } from '../models/service.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ServiceCatalogService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/services`;

  getAll(): Observable<ServiceItem[]> {
    return this.http.get<ServiceItem[]>(this.baseUrl);
  }

  create(request: CreateServiceRequest): Observable<number> {
    return this.http.post<number>(this.baseUrl, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
