export interface ClientListItem {
    id: number;
    fullName: string;
    phone: string;
  isMembershipActive: boolean;
}

export interface ClientDetail {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  notes: string | null;
  isMembershipActive: boolean;
  membershipExpiry: string | null; // dates arrive as ISO strings over JSON, not Date objects
  pastAppointments: AppointmentHistoryItem[];
}

export interface AppointmentHistoryItem {
  date: string;
  serviceName: string;
  staffName: string;
  status: string;
}


export interface CreateClientRequest {
  fullName: string;
  phone: string;
  email: string;
  notes?: string;
}


export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}