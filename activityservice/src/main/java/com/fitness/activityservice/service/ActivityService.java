package com.fitness.activityservice.service;

import com.fitness.activityservice.dto.ActivityRequest;
import com.fitness.activityservice.dto.ActivityResponse;
import com.fitness.activityservice.model.Activity;
import com.fitness.activityservice.repository.ActivityRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final UserValidationService userValidationService;
    private final KafkaTemplate<String, Activity> kafkaTemplate;

    @Value("${kafka.topic.name}")
    private String topicName;
    public ActivityService(ActivityRepository activityRepository, UserValidationService userValidationService, KafkaTemplate<String, Activity> kafkaTemplate) {
        this.activityRepository = activityRepository;
        this.userValidationService = userValidationService;
        this.kafkaTemplate = kafkaTemplate;
    }

    public @Nullable ActivityResponse trackActivity(ActivityRequest request) {
        boolean isValidUser = userValidationService.validateUser(request.getUserId());
        if(!isValidUser) {
            throw new RuntimeException("Invalid User: " + request.getUserId());
        }
        Activity activity = Activity.builder()
                .userId(request.getUserId())
                .activityType(request.getActivityType())
                .duration(request.getDuration())
                .caloriesBurned(request.getCaloriesBurned())
                .startTime(request.getStartTime())
                .additionalMetrics(request.getAdditionalMetrics())
                .build();




        Activity savedActivity = activityRepository.save(activity);
        log.info("ACTIVITY BEFORE KAFKA: {}", savedActivity);
        log.info("ACTIVITY TYPE BEFORE KAFKA: {}", savedActivity.getActivityType());
        try {
            kafkaTemplate.send(topicName, savedActivity.getUserId(), savedActivity);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return mapToResponse(savedActivity);
    }

    private ActivityResponse mapToResponse(Activity savedActivity) {
        ActivityResponse activityResponse = new ActivityResponse();

        activityResponse.setId(savedActivity.getId());
        activityResponse.setUserId((savedActivity.getUserId()));
        activityResponse.setActivityType((savedActivity.getActivityType()));
        activityResponse.setDuration(savedActivity.getDuration());
        activityResponse.setCaloriesBurned(savedActivity.getCaloriesBurned());
        activityResponse.setStartTime(savedActivity.getStartTime());
        activityResponse.setAdditionalMetrics(savedActivity.getAdditionalMetrics());
        activityResponse.setCreatedAt((savedActivity.getCreatedAt()));
        activityResponse.setUpdatedAt((savedActivity.getUpdatedAt()));

        return activityResponse;
    }

    public @Nullable List<ActivityResponse> getUserActivities(String userId) {
        List<Activity> activityList = activityRepository.findByUserId(userId);
        return activityList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}
