export interface Membership {
  id: number;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
}

export interface ExpiringMembership {
  clientId: number;
  clientName: string;
  phone: string;
  expiryDate: string;
  telegramChatId?: string | null;
}

export interface RenewMembershipRequest {
  clientId: number;
  durationMonths: number;
}