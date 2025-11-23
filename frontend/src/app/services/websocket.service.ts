import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  type: string;
  title: string;
  message: string;
  relatedEntityId: string;
  read: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client | null = null;
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);

  constructor() {}

  connect(userId: string): void {
    const socket = new SockJS('http://localhost:8081/ws-endpoint');

    this.stompClient = new Client({
      webSocketFactory: () => socket as any,
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      this.connectionStatusSubject.next(true);

      // Subscribe to user-specific notifications
      this.stompClient?.subscribe(`/user/${userId}/queue/notifications`, (message: IMessage) => {
        const notification = JSON.parse(message.body);
        console.log('Received notification:', notification);
        this.notificationSubject.next(notification);
      });

      // Subscribe to manager broadcasts (if user is a manager)
      this.stompClient?.subscribe('/topic/managers', (message: IMessage) => {
        const notification = JSON.parse(message.body);
        console.log('Received manager notification:', notification);
        this.notificationSubject.next(notification);
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
      this.connectionStatusSubject.next(false);
    };

    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient !== null) {
      this.stompClient.deactivate();
      this.connectionStatusSubject.next(false);
      console.log('Disconnected');
    }
  }

  getNotifications(): Observable<Notification | null> {
    return this.notificationSubject.asObservable();
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable();
  }

  isConnected(): boolean {
    return this.stompClient?.connected || false;
  }
}
