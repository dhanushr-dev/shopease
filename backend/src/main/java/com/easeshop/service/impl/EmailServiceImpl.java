package com.easeshop.service.impl;

import com.easeshop.entity.Order;
import com.easeshop.entity.OrderItem;
import com.easeshop.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

/**
 * Implementation of EmailService using Spring Mail.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    @Async
    public void sendOrderConfirmationEmail(Order order) {
        try {
            log.info("📧 Preparing order confirmation email for: {}", order.getUser().getEmail());

            StringBuilder body = new StringBuilder();
            body.append("Dear ").append(order.getUser().getName()).append(",\n\n");
            body.append("Thank you for your order with ShopEase!\n");
            body.append("Your Order Number is: ").append(order.getOrderNumber()).append("\n\n");
            
            body.append("--------------------------------------------------\n");
            body.append("ORDER SUMMARY:\n");
            body.append("--------------------------------------------------\n");
            for (OrderItem item : order.getItems()) {
                body.append(item.getProductName())
                        .append(" (Qty: ").append(item.getQuantity()).append(")")
                        .append(" - ₹").append(item.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())))
                        .append("\n");
                if (item.getSelectedVariant() != null && !item.getSelectedVariant().isBlank()) {
                    body.append("  Variant: ").append(item.getSelectedVariant()).append("\n");
                }
            }
            body.append("--------------------------------------------------\n");
            if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(java.math.BigDecimal.ZERO) > 0) {
                body.append("Discount: -₹").append(order.getDiscountAmount()).append("\n");
            }
            body.append("Total Amount: ₹").append(order.getTotalAmount()).append("\n");
            body.append("Payment Method: ").append(order.getPaymentMethod()).append("\n");
            body.append("Payment Status: ").append(order.getPaymentStatus()).append("\n");
            body.append("--------------------------------------------------\n\n");

            if (order.getShippingAddress() != null) {
                body.append("SHIPPING ADDRESS:\n");
                body.append(order.getShippingAddress().getFullName()).append("\n")
                        .append(order.getShippingAddress().getAddressLine1()).append("\n");
                if (order.getShippingAddress().getAddressLine2() != null && !order.getShippingAddress().getAddressLine2().isBlank()) {
                    body.append(order.getShippingAddress().getAddressLine2()).append("\n");
                }
                body.append(order.getShippingAddress().getCity()).append(", ")
                        .append(order.getShippingAddress().getState()).append(" - ")
                        .append(order.getShippingAddress().getPostalCode()).append("\n")
                        .append(order.getShippingAddress().getCountry()).append("\n\n");
            }

            body.append("You can track your order status in your profile dashboard.\n\n");
            body.append("Happy Shopping!\n\nBest regards,\nShopEase Team");

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(order.getUser().getEmail());
            message.setSubject("ShopEase Order Confirmation - " + order.getOrderNumber());
            message.setText(body.toString());
            message.setFrom("no-reply@shopease.com");

            mailSender.send(message);
            log.info("📧 Order confirmation email sent successfully to {}", order.getUser().getEmail());
        } catch (Exception e) {
            log.error("❌ Failed to send order confirmation email. SMTP may not be configured. Error: {}", e.getMessage());
            // Safe fallback: do not throw exception to avoid breaking checkout transaction
        }
    }
}
