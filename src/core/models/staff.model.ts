export interface StaffListItem {
  id: number;
  fullName: string;
  phone: string;
  commissionRate: number;
}

export interface StaffDetail extends StaffListItem {
  totalAppointments: number;
}

export interface TimeSlot {
  startTime: string;
  isAvailable: boolean;
}

export interface CreateStaffRequest {
  fullName: string;
  phone: string;
  commissionRate: number;
}

export interface UpdateStaffRequest {
  fullName: string;
  phone: string;
  commissionRate: number;
}