package com.easeshop.service;

import com.easeshop.entity.Order;

/**
 * Service for sending transactional email notifications.
 */
public interface EmailService {
    /**
     * Sends an order confirmation email to the customer.
     * @param order the placed order details
     */
    void sendOrderConfirmationEmail(Order order);
}
