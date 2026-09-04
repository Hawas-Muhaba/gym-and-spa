import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientListItem, ClientDetail, CreateClientRequest, PagedResult } from '../models/client.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/clients`;

  getAll(pageNumber = 1, pageSize = 20, search?: string): Observable<PagedResult<ClientListItem>> {
    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.http.get<PagedResult<ClientListItem>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<ClientDetail> {
    return this.http.get<ClientDetail>(`${this.baseUrl}/${id}`);
  }

  update(id: number, request: { fullName: string; phone: string; email: string; notes?: string | null }): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  getMyProfile(): Observable<{ id: number; fullName: string; phone: string; email: string }> {
    return this.http.get<{ id: number; fullName: string; phone: string; email: string }>(`${this.baseUrl}/me`);
  }

  create(request: CreateClientRequest): Observable<number> {
    return this.http.post<number>(this.baseUrl, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}