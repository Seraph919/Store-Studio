package org.storestudio.store.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String adminEmail;

    @Async
    public void sendNewOrderAlert(String sellerEmail, Long orderId, String guestName, BigDecimal totalPrice) {
        try {
            log.info("Sending new order alert email for order #{} to seller: {}", orderId, sellerEmail);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(adminEmail);
            message.setTo(sellerEmail);
            message.setSubject("New Order Received! #" + orderId);
            message.setText(String.format(
                "Hello,\n\nYou have received a new order!\n\n" +
                "Order ID: #%d\nCustomer: %s\nTotal: $%.2f\n\n" +
                "Log in to your seller dashboard to confirm the call and process dispatch.",
                orderId, guestName, totalPrice
            ));

            mailSender.send(message);
            log.info("Successfully sent new order alert email for order #{} to seller: {}", orderId, sellerEmail);
        } catch (Exception e) {
            log.error("Failed to send new order alert email for order #{} to seller: {}", orderId, sellerEmail, e);
        }
    }
}

