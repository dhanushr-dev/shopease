package com.easeshop.service;

import com.easeshop.dto.request.ReturnOrReplaceRequest;
import com.easeshop.dto.response.RefundResponse;
import com.easeshop.dto.response.ReplacementRequestResponse;
import com.easeshop.dto.response.ReturnRequestResponse;

import java.util.List;

public interface ReturnReplaceService {
    ReturnRequestResponse createReturnRequest(String email, Long orderId, ReturnOrReplaceRequest request);
    ReplacementRequestResponse createReplacementRequest(String email, Long orderId, ReturnOrReplaceRequest request);
    
    List<ReturnRequestResponse> getUserReturns(String email);
    List<ReplacementRequestResponse> getUserReplacements(String email);
    List<RefundResponse> getUserRefunds(String email);
    RefundResponse getRefundByOrderId(String email, Long orderId);

    List<ReturnRequestResponse> getAllReturns();
    ReturnRequestResponse approveReturn(Long returnId);
    ReturnRequestResponse rejectReturn(Long returnId);

    List<ReplacementRequestResponse> getAllReplacements();
    ReplacementRequestResponse approveReplacement(Long replacementId);
    ReplacementRequestResponse rejectReplacement(Long replacementId);

    List<RefundResponse> getAllRefunds();
    RefundResponse completeRefund(Long refundId);
}
