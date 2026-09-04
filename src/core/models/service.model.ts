export interface ServiceItem {
  id: number;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface CreateServiceRequest {
  name: string;
  price: number;
  durationMinutes: number;
}