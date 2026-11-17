package com.fitness.aiservice.service;

import com.fitness.aiservice.models.Activity;
import com.fitness.aiservice.models.Recommendation;
import com.fitness.aiservice.repository.RecommendationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ActivityMessageListener {
    private ActivityAIService activityAIService;
    private RecommendationRepository recommendationRepository;


    public ActivityMessageListener(ActivityAIService activityAIService, RecommendationRepository recommendationRepository) {
        this.recommendationRepository = recommendationRepository;
        this.activityAIService = activityAIService;
    }
    @KafkaListener(
            topics = "${kafka.topic.name}",
            groupId = "activity-processor-group"
    )
    public void processActivity(Activity activity) {

        log.info("========== KAFKA MESSAGE RECEIVED ==========");
        log.info("Activity ID       : {}", activity.getId());
        log.info("User ID           : {}", activity.getUserId());
        log.info("Activity Type     : {}", activity.getActivityType());
        log.info("Duration          : {}", activity.getDuration());
        log.info("Calories Burned   : {}", activity.getCaloriesBurned());
        log.info("Start Time        : {}", activity.getStartTime());
        log.info("Additional Metrics: {}", activity.getAdditionalMetrics());
        log.info("============================================");

        Recommendation recommendation =
                activityAIService.generateRecommendation(activity);

        recommendationRepository.save(recommendation);
    }
}
