export interface RecordPaymentRequest {
  appointmentId: number;
  amount: number;
}

export interface CommissionReport {
  staffId: number;
  staffName: string;
  totalRevenue: number;
  totalCommission: number;
  paymentCount: number;
  transactions?: PaymentTransaction[];
}

export interface PaymentTransaction {
  paymentId: number;
  appointmentId: number;
  clientName: string;
  serviceName: string;
  amount: number;
  commission: number;
  paidAt: string;
}