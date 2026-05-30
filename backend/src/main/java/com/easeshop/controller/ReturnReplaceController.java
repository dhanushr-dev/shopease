package com.easeshop.controller;

import com.easeshop.dto.request.ReturnOrReplaceRequest;
import com.easeshop.dto.response.ApiResponse;
import com.easeshop.dto.response.RefundResponse;
import com.easeshop.dto.response.ReplacementRequestResponse;
import com.easeshop.dto.response.ReturnRequestResponse;
import com.easeshop.dto.response.PagedResponse;
import com.easeshop.service.ReturnReplaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Returns and Replacements", description = "Return, Replace, and Refund APIs")
public class ReturnReplaceController {

    private final ReturnReplaceService service;

    // User Endpoints
    @PostMapping("/orders/{orderId}/return")
    @Operation(summary = "Request a return")
    public ResponseEntity<ApiResponse<ReturnRequestResponse>> requestReturn(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId,
            @RequestBody ReturnOrReplaceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.createReturnRequest(userDetails.getUsername(), orderId, request), "Return requested"));
    }

    @PostMapping("/orders/{orderId}/replace")
    @Operation(summary = "Request a replacement")
    public ResponseEntity<ApiResponse<ReplacementRequestResponse>> requestReplacement(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId,
            @RequestBody ReturnOrReplaceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.createReplacementRequest(userDetails.getUsername(), orderId, request), "Replacement requested"));
    }

    @GetMapping("/orders/{orderId}/refund")
    @Operation(summary = "Get refund by order id")
    public ResponseEntity<ApiResponse<RefundResponse>> getRefundByOrderId(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(service.getRefundByOrderId(userDetails.getUsername(), orderId), "Refund fetched"));
    }

    @GetMapping("/users/returns")
    @Operation(summary = "Get current user returns")
    public ResponseEntity<ApiResponse<List<ReturnRequestResponse>>> getUserReturns(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(service.getUserReturns(userDetails.getUsername()), "Returns fetched"));
    }

    @GetMapping("/users/replacements")
    @Operation(summary = "Get current user replacements")
    public ResponseEntity<ApiResponse<List<ReplacementRequestResponse>>> getUserReplacements(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(service.getUserReplacements(userDetails.getUsername()), "Replacements fetched"));
    }

    @GetMapping("/users/refunds")
    @Operation(summary = "Get current user refunds")
    public ResponseEntity<ApiResponse<List<RefundResponse>>> getUserRefunds(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(service.getUserRefunds(userDetails.getUsername()), "Refunds fetched"));
    }

    // Admin Endpoints
    @GetMapping("/admin/returns")
    @Operation(summary = "Get all returns")
    public ResponseEntity<ApiResponse<PagedResponse<ReturnRequestResponse>>> getAllReturns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        int limitSize = Math.min(size, 100);
        return ResponseEntity.ok(ApiResponse.success(service.getAllReturns(page, limitSize), "All returns fetched"));
    }

    @PutMapping("/admin/returns/{returnId}/approve")
    @Operation(summary = "Approve return")
    public ResponseEntity<ApiResponse<ReturnRequestResponse>> approveReturn(@PathVariable Long returnId) {
        return ResponseEntity.ok(ApiResponse.success(service.approveReturn(returnId), "Return approved"));
    }

    @PutMapping("/admin/returns/{returnId}/reject")
    @Operation(summary = "Reject return")
    public ResponseEntity<ApiResponse<ReturnRequestResponse>> rejectReturn(@PathVariable Long returnId) {
        return ResponseEntity.ok(ApiResponse.success(service.rejectReturn(returnId), "Return rejected"));
    }

    @GetMapping("/admin/replacements")
    @Operation(summary = "Get all replacements")
    public ResponseEntity<ApiResponse<PagedResponse<ReplacementRequestResponse>>> getAllReplacements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        int limitSize = Math.min(size, 100);
        return ResponseEntity.ok(ApiResponse.success(service.getAllReplacements(page, limitSize), "All replacements fetched"));
    }

    @PutMapping("/admin/replacements/{replacementId}/approve")
    @Operation(summary = "Approve replacement")
    public ResponseEntity<ApiResponse<ReplacementRequestResponse>> approveReplacement(@PathVariable Long replacementId) {
        return ResponseEntity.ok(ApiResponse.success(service.approveReplacement(replacementId), "Replacement approved"));
    }

    @PutMapping("/admin/replacements/{replacementId}/reject")
    @Operation(summary = "Reject replacement")
    public ResponseEntity<ApiResponse<ReplacementRequestResponse>> rejectReplacement(@PathVariable Long replacementId) {
        return ResponseEntity.ok(ApiResponse.success(service.rejectReplacement(replacementId), "Replacement rejected"));
    }

    @GetMapping("/admin/refunds")
    @Operation(summary = "Get all refunds")
    public ResponseEntity<ApiResponse<PagedResponse<RefundResponse>>> getAllRefunds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        int limitSize = Math.min(size, 100);
        return ResponseEntity.ok(ApiResponse.success(service.getAllRefunds(page, limitSize), "All refunds fetched"));
    }

    @PutMapping("/admin/refunds/{refundId}/complete")
    @Operation(summary = "Mark refund as completed")
    public ResponseEntity<ApiResponse<RefundResponse>> completeRefund(@PathVariable Long refundId) {
        return ResponseEntity.ok(ApiResponse.success(service.completeRefund(refundId), "Refund completed"));
    }
}
