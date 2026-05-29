package com.easeshop.service.impl;

import com.easeshop.dto.request.AnswerRequest;
import com.easeshop.dto.request.QuestionRequest;
import com.easeshop.entity.ProductQuestion;
import com.easeshop.entity.User;
import com.easeshop.exception.ResourceNotFoundException;
import com.easeshop.repository.ProductQuestionRepository;
import com.easeshop.service.ProductQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductQuestionServiceImpl implements ProductQuestionService {

    private final ProductQuestionRepository questionRepository;

    @Override
    @Transactional
    public ProductQuestion askQuestion(Long productId, User user, QuestionRequest request) {
        ProductQuestion question = ProductQuestion.builder()
                .productId(productId)
                .userId(user.getId())
                .userName(user.getName())
                .question(request.getQuestion())
                .build();
        return questionRepository.save(question);
    }

    @Override
    public List<ProductQuestion> getQuestionsByProduct(Long productId) {
        return questionRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    @Override
    public List<ProductQuestion> getAllQuestions() {
        return questionRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    @Transactional
    public ProductQuestion answerQuestion(Long questionId, AnswerRequest request) {
        ProductQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        
        question.setAnswer(request.getAnswer());
        question.setAnsweredAt(LocalDateTime.now());
        return questionRepository.save(question);
    }
}
