package com.easeshop.service;

import com.easeshop.dto.request.OrderRequest;
import com.easeshop.dto.request.OrderStatusRequest;
import com.easeshop.dto.response.OrderResponse;
import java.util.List;

public interface OrderService {
    /** Places a new order from the user's cart. */
    OrderResponse placeOrder(String email, OrderRequest request);
    /** Gets all orders for a user. */
    List<OrderResponse> getUserOrders(String email);
    /** Gets an order by ID. */
    OrderResponse getOrderById(String email, Long orderId);
    /** Cancels an order. */
    com.easeshop.dto.response.OrderCancelResponse cancelOrder(String email, Long orderId);
    /** Gets all orders (admin). */
    List<OrderResponse> getAllOrders();
    /** Updates order status (admin). */
    OrderResponse updateOrderStatus(Long orderId, OrderStatusRequest request);
    /** Gets order tracking timeline. */
    java.util.List<java.util.Map<String, Object>> getOrderTracking(Long orderId);
}
