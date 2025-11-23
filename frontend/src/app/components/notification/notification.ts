import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WebSocketService, Notification } from '../../services/websocket.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.html',
  styleUrls: ['./notification.css'],
  standalone: true,
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;
  isConnected = false;
  userId = ''; // Get from auth service

  private notificationSubscription?: Subscription;
  private connectionSubscription?: Subscription;
  private unreadCountSubscription?: Subscription;

  constructor(
    private webSocketService: WebSocketService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // TODO: Get actual user ID from authentication service
    this.userId = localStorage.getItem('employeeId') || '';

    // Connect to WebSocket
    this.webSocketService.connect(this.userId);

    // Subscribe to connection status
    this.connectionSubscription = this.webSocketService.getConnectionStatus()
      .subscribe(status => {
        this.isConnected = status;
      });

    // Subscribe to real-time notifications
    this.notificationSubscription = this.webSocketService.getNotifications()
      .subscribe(notification => {
        if (notification) {
          console.log('New notification received:', notification);

          // Add to notifications list
          this.notifications.unshift(notification);

          // Increment unread count
          this.notificationService.incrementUnreadCount();
        }
      });

    // Subscribe to unread count
    this.unreadCountSubscription = this.notificationService.getUnreadCountObservable()
      .subscribe(count => {
        this.unreadCount = count;
      });

    // Load existing notifications
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
    this.connectionSubscription?.unsubscribe();
    this.unreadCountSubscription?.unsubscribe();
    this.webSocketService.disconnect();
  }

  loadNotifications(): void {
    this.notificationService.getUserNotifications(this.userId).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });

    // Load unread count
    this.notificationService.getUnreadCount(this.userId).subscribe({
      next: (count) => {
        this.unreadCount = count;
      }
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  handleNotificationClick(notification: Notification): void {
    // Mark as read
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.read = true;
        }
      });
    }

    // Navigate based on notification type
    if (notification.type === 'LEAVE_REQUEST') {
      this.router.navigate(['/conges/manage']);
    } else if (notification.type === 'LEAVE_APPROVED' || notification.type === 'LEAVE_REJECTED') {
      this.router.navigate(['/conges/my-requests']);
    }

    this.showNotifications = false;
  }

  viewAllNotifications(): void {
    this.router.navigate(['/notifications']);
    this.showNotifications = false;
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

    return date.toLocaleDateString();
  }
}
