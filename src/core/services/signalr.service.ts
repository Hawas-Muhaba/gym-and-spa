import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { ScheduleItem } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class SignalrService {
  private hubConnection?: signalR.HubConnection;

  // A signal holding the latest live booking event — components can react to this
  newBooking = signal<ScheduleItem | null>(null);

  connect(staffId: number, token: string) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl.replace('/api', '')}/bookingHub`, {
        accessTokenFactory: () => token, // SignalR needs the JWT passed this way, not as a header
      })
      .withAutomaticReconnect() // reconnects on dropped wifi, common on mobile — small but valuable detail
      .build();

    this.hubConnection.start()
      .then(() => this.hubConnection!.invoke('JoinStaffGroup', staffId))
      .catch((err) => console.error('SignalR connection error:', err));

    this.hubConnection.on('NewBookingCreated', (booking: ScheduleItem) => {
      this.newBooking.set(booking);
    });
  }

  disconnect() {
    this.hubConnection?.stop();
  }
}