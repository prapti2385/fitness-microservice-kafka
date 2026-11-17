package com.fitness.aiservice.service;

import com.fitness.aiservice.models.Recommendation;
import com.fitness.aiservice.repository.RecommendationRepository;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RecommendationService {
    private final RecommendationRepository recommendationRepository;

    public  RecommendationService(RecommendationRepository recommendationRepository) {
        this.recommendationRepository = recommendationRepository;
    }
    public @Nullable List<Recommendation> getUserRecommendation(String userId) {
        return recommendationRepository.findByUserId(userId);
    }

    public @Nullable Recommendation getActivityRecommendation(String activityId) {
        return recommendationRepository.findByActivityId(activityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No recommendation found for this activity: " + activityId));
    }
}
