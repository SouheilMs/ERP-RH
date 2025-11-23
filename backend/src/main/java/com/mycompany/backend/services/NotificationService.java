package com.mycompany.backend.services;

import com.mycompany.backend.entities.Notification;

import java.util.List;

public interface NotificationService {

    Notification sendNotification(String recipientId, String senderId, String senderName,
                                  String type, String title, String message, String relatedEntityId);

    void broadcastToManagers(Notification notification);

    List<Notification> getUserNotifications(String userId);

    List<Notification> getUnreadNotifications(String userId);

    long getUnreadCount(String userId);

    Notification markAsRead(String notificationId);
}
