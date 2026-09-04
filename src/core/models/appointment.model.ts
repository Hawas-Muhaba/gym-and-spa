export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'NoShow';

export interface AppointmentListItem {
  id: number;
  staffName: string;
  serviceName: string;
  startTime: string;
  status: BookingStatus;
}

export interface AppointmentDetail {
  id: number;
  clientName: string;
  staffName: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
}

export interface ScheduleItem {
  appointmentId: number;
  clientName: string;
  serviceName: string;
  startTime: string;
  status: BookingStatus;
  servicePrice?: number;
  commissionRate?: number;
}

export interface CreateAppointmentRequest {
  clientId: number;
  staffId: number;
  serviceId: number;
  startTime: string;
}