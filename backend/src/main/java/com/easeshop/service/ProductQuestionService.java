package com.easeshop.service;

import com.easeshop.dto.request.AnswerRequest;
import com.easeshop.dto.request.QuestionRequest;
import com.easeshop.entity.ProductQuestion;
import com.easeshop.entity.User;

import java.util.List;

public interface ProductQuestionService {
    ProductQuestion askQuestion(Long productId, User user, QuestionRequest request);
    List<ProductQuestion> getQuestionsByProduct(Long productId);
    List<ProductQuestion> getAllQuestions();
    ProductQuestion answerQuestion(Long questionId, AnswerRequest request);
}
