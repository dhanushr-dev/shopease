package com.easeshop.controller;

import com.easeshop.dto.request.OrderRequest;
import com.easeshop.dto.response.ApiResponse;
import com.easeshop.dto.response.OrderResponse;
import com.easeshop.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management APIs")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Place a new order from cart")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody(required = false) OrderRequest request) {
        OrderResponse order = orderService.placeOrder(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(order, "Order placed successfully"));
    }

    @GetMapping
    @Operation(summary = "Get current user's orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getUserOrders(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<OrderResponse> orders = orderService.getUserOrders(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(orders, "Orders fetched"));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        OrderResponse order = orderService.getOrderById(userDetails.getUsername(), orderId);
        return ResponseEntity.ok(ApiResponse.success(order, "Order fetched"));
    }

    @PutMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel an order")
    public ResponseEntity<ApiResponse<com.easeshop.dto.response.OrderCancelResponse>> cancelOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        com.easeshop.dto.response.OrderCancelResponse response = orderService.cancelOrder(userDetails.getUsername(), orderId);
        return ResponseEntity.ok(ApiResponse.success(response, response.getMessage()));
    }

    @GetMapping("/{orderId}/invoice")
    @Operation(summary = "Get invoice data for an order")
    public ResponseEntity<ApiResponse<OrderResponse>> getInvoice(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        OrderResponse order = orderService.getOrderById(userDetails.getUsername(), orderId);
        return ResponseEntity.ok(ApiResponse.success(order, "Invoice data fetched"));
    }

    @GetMapping("/{orderId}/tracking")
    @Operation(summary = "Get order tracking timeline")
    public ResponseEntity<ApiResponse<java.util.List<java.util.Map<String, Object>>>> getOrderTracking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        // Verify ownership
        orderService.getOrderById(userDetails.getUsername(), orderId);
        java.util.List<java.util.Map<String, Object>> tracking = orderService.getOrderTracking(orderId);
        return ResponseEntity.ok(ApiResponse.success(tracking, "Tracking fetched"));
    }

    @PostMapping("/{orderId}/verify")
    @Operation(summary = "Verify Razorpay payment signature")
    public ResponseEntity<ApiResponse<OrderResponse>> verifyPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId,
            @RequestBody java.util.Map<String, String> request) {

        // Accept both naming conventions for compatibility
        // Frontend may send: paymentId / razorpayPaymentId
        // Frontend may send: signature / razorpaySignature
        String paymentId = coalesce(request.get("paymentId"), request.get("razorpayPaymentId"));
        String razorpayOrderId = coalesce(request.get("razorpayOrderId"), request.get("razorpayOrderId"));
        String signature = coalesce(request.get("signature"), request.get("razorpaySignature"));

        // Log received fields for debugging (no secrets logged)
        org.slf4j.LoggerFactory.getLogger(getClass()).info(
            "🔍 Verify request for order {}: paymentId={}, razorpayOrderId={}, hasSignature={}",
            orderId, paymentId, razorpayOrderId, signature != null && !signature.isBlank());

        // Validate required fields
        if (paymentId == null || paymentId.isBlank()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Missing required field: paymentId (razorpay_payment_id)"));
        }
        if (razorpayOrderId == null || razorpayOrderId.isBlank()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Missing required field: razorpayOrderId (razorpay_order_id)"));
        }
        if (signature == null || signature.isBlank()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Missing required field: signature (razorpay_signature)"));
        }

        OrderResponse order = orderService.verifyRazorpayPayment(
                userDetails.getUsername(), orderId, paymentId, razorpayOrderId, signature);
        return ResponseEntity.ok(ApiResponse.success(order, "Payment verified successfully. Your order has been placed."));
    }

    /** Returns first non-null, non-blank string or null if all are blank. */
    private String coalesce(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) return v;
        }
        return null;
    }
}
