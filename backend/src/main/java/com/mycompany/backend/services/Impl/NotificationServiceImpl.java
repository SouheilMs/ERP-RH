package com.mycompany.backend.services.Impl;

import com.mycompany.backend.entities.Notification;
import com.mycompany.backend.repositories.NotificationRepository;
import com.mycompany.backend.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public Notification sendNotification(String recipientId, String senderId, String senderName,
                                         String type, String title, String message, String relatedEntityId) {
        // Create and save notification
        Notification notification = new Notification(
                recipientId, senderId, senderName, type, title, message, relatedEntityId
        );
        notification = notificationRepository.save(notification);

        // Send real-time notification via WebSocket
        // Using /queue for user-specific messages
        messagingTemplate.convertAndSendToUser(
                recipientId,
                "/queue/notifications",
                notification
        );

        return notification;
    }

    public void broadcastToManagers(Notification notification) {
        // Save notification
        notificationRepository.save(notification);

        // Broadcast to all managers subscribed to /topic/managers
        messagingTemplate.convertAndSend("/topic/managers", notification);
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByRecipientIdAndReadOrderByCreatedAtDesc(userId, false);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByRecipientIdAndRead(userId, false);
    }

    public Notification markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
