package com.easeshop.service;

import com.easeshop.dto.request.ReturnOrReplaceRequest;
import com.easeshop.dto.response.RefundResponse;
import com.easeshop.dto.response.ReplacementRequestResponse;
import com.easeshop.dto.response.ReturnRequestResponse;
import com.easeshop.dto.response.PagedResponse;

import java.util.List;

public interface ReturnReplaceService {
    ReturnRequestResponse createReturnRequest(String email, Long orderId, ReturnOrReplaceRequest request);
    ReplacementRequestResponse createReplacementRequest(String email, Long orderId, ReturnOrReplaceRequest request);
    
    List<ReturnRequestResponse> getUserReturns(String email);
    List<ReplacementRequestResponse> getUserReplacements(String email);
    List<RefundResponse> getUserRefunds(String email);
    RefundResponse getRefundByOrderId(String email, Long orderId);

    PagedResponse<ReturnRequestResponse> getAllReturns(int page, int size);
    ReturnRequestResponse approveReturn(Long returnId);
    ReturnRequestResponse rejectReturn(Long returnId);

    PagedResponse<ReplacementRequestResponse> getAllReplacements(int page, int size);
    ReplacementRequestResponse approveReplacement(Long replacementId);
    ReplacementRequestResponse rejectReplacement(Long replacementId);

    PagedResponse<RefundResponse> getAllRefunds(int page, int size);
    RefundResponse completeRefund(Long refundId);
}
