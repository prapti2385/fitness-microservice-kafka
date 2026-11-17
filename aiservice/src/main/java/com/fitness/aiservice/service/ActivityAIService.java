package com.fitness.aiservice.service;

import com.fitness.aiservice.models.Activity;
import com.fitness.aiservice.models.Recommendation;
import com.fitness.aiservice.service.GeminiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
public class ActivityAIService {
    private final GeminiService geminiService;

    public ActivityAIService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    public Recommendation generateRecommendation(Activity activity) {
        long start = System.currentTimeMillis();
        String prompt = createPromptForActivity(activity);
        log.info("Prompt created in {} ms",
                System.currentTimeMillis() - start);
        long geminiStart = System.currentTimeMillis();
        String aiResponse;
        try {
            aiResponse = geminiService.getRecommendations(prompt);
        } catch (Exception e) {
            log.error("Gemini call failed for activity {}", activity.getId(), e);
            return createDefaultRecommendation(activity);
        }
        log.info("Gemini response received in {} ms",
                System.currentTimeMillis() - geminiStart);
        long parsingStart = System.currentTimeMillis();
        Recommendation recommendation =
                processAIResponse(activity, aiResponse);
        log.info("Response parsed in {} ms",
                System.currentTimeMillis() - parsingStart);
        return recommendation;
    }

    private Recommendation processAIResponse(Activity activity, String aiResponse) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(aiResponse);
            // Take the last text in the response, whichever step it is in.
            String answerText = "";
            for (JsonNode step : rootNode.path("steps")) {
                for (JsonNode part : step.path("content")) {
                    String t = part.path("text").asText("");
                    if (!t.isBlank()) {
                        answerText = t;
                    }
                }
            }
            if (answerText.isBlank()) {
                throw new IllegalStateException("No text found in Gemini response");
            }
            String jsonContent = answerText.replaceAll("```json\\n", "").replaceAll("\\n```", "").trim();
//            log.info("CLEANED RESPONSE FROM AI: {}" + jsonContent);

            JsonNode analysisJson = mapper.readTree(jsonContent);
            JsonNode analysisNode = analysisJson.path("analysis");
            StringBuilder fullAnalysis = new StringBuilder();
            addAnalysisSection(fullAnalysis, analysisNode, "overall", "Overall: ");
            addAnalysisSection(fullAnalysis, analysisNode, "pace", "Pace: ");
            addAnalysisSection(fullAnalysis, analysisNode, "heartRate", "Heart Rate: ");
            addAnalysisSection(fullAnalysis, analysisNode, "caloriesBurned", "Calories Burned: ");

            List<String> improvements = extractImprovements(analysisJson.path("improvements"));
            List<String> suggestions = extractSuggestions(analysisJson.path("suggestions"));
            List<String> safety = extractSafetyGuidelines(analysisJson.path("safety"));

            return Recommendation.builder()
                    .activityId(activity.getId())
                    .userId(activity.getUserId())
                    .activityType(activity.getActivityType().toString())
                    .recommendation(fullAnalysis.toString())
                    .improvements(improvements)
                    .suggestions(suggestions)
                    .safety(safety)
                    .createdAt(LocalDateTime.now())
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return createDefaultRecommendation(activity);
        }
    }

    private Recommendation createDefaultRecommendation(Activity activity) {
        return Recommendation.builder()
                .activityId(activity.getId())
                .userId(activity.getUserId())
                .activityType(activity.getActivityType().toString())
                .recommendation("Unable to generate detailed analysis")
                .improvements(Collections.singletonList("Continue with your current routine"))
                .suggestions(Collections.singletonList("Consider consulting a fitness consultant"))
                .safety(Arrays.asList(
                        "Always warm up before exercise",
                        "Stay hydrated",
                        "Listen to your body"
                ))
                .createdAt(LocalDateTime.now())
                .build();
    }

    private List<String> extractSafetyGuidelines(JsonNode safetyNode) {
        List<String> safety = new ArrayList<>();
        if(safetyNode.isArray()) {
            safetyNode.forEach(item -> safety.add(item.asText()));
        }
        return safety.isEmpty() ? Collections.singletonList("Follow general safety guidelines") : safety;
    }

    private List<String> extractSuggestions(JsonNode suggestionsNode) {
        List<String> suggestions = new ArrayList<>();
        if(suggestionsNode.isArray()) {
            suggestionsNode.forEach(suggestion -> {
                String workout = suggestion.path("workout").asText();
                String description = suggestion.path("description").asText();
                suggestions.add(String.format("%s : %s", workout, description));
            });
        }

        return suggestions.isEmpty() ? Collections.singletonList("No specific suggestions to provide") : suggestions;
    }

    private List<String> extractImprovements(JsonNode improvementsNode) {
        List<String> improvements = new ArrayList<>();
        if (improvementsNode.isArray()) {
            improvementsNode.forEach(improvement -> {
                String area = improvement.path("area").asText();
                String recommendation = improvement.path("recommendation").asText();
                improvements.add(String.format("%s: %s", area, recommendation));
            });
        }

        return improvements.isEmpty() ? Collections.singletonList("No specific improvements to provide") : improvements;
    }

    private void addAnalysisSection(StringBuilder fullAnalysis, JsonNode analysisNode, String key, String prefix) {
        if(!analysisNode.path(key).isMissingNode()) {
            fullAnalysis.append(prefix).append(analysisNode.path(key).asText()).append("\n\n");
        }
    }


    private String createPromptForActivity(Activity activity) {

        return String.format("""
        You are an expert fitness coach and exercise analyst.

        Analyze the following fitness activity and generate detailed,
        personalized recommendations based on the provided activity data.

        Your response MUST follow this exact JSON structure:

        {
          "analysis": {
            "overall": "Detailed overall analysis of the activity",
            "pace": "Analysis of the user's pace and performance",
            "heartRate": "Analysis of heart rate, if available",
            "caloriesBurned": "Analysis of calories burned"
          },
          "improvements": [
            {
              "area": "Name of the area that needs improvement",
              "recommendation": "Detailed and actionable recommendation"
            }
          ],
          "suggestions": [
            {
              "workout": "Name of the suggested workout",
              "description": "Detailed description of the workout"
            }
          ],
          "safety": [
            "Relevant safety recommendation 1",
            "Relevant safety recommendation 2"
          ]
        }

        ACTIVITY DETAILS:

        Activity Type: %s
        Duration: %d minutes
        Calories Burned: %d
        Additional Metrics: %s

        ANALYSIS GUIDELINES:

        1. Analyze the activity based on the actual data provided.
        2. Provide meaningful insights about performance.
        3. Suggest realistic and actionable improvements.
        4. Recommend suitable future workouts.
        5. Include relevant safety precautions.
        6. If a metric is missing, explicitly mention that it
           is unavailable instead of assuming or inventing values.
        7. Do not make unsupported medical claims.
        8. Keep recommendations practical and personalized.

        STRICT OUTPUT RULES:

        1. Return ONLY one valid JSON object.
        2. Do NOT return Markdown.
        3. Do NOT use ```json or ``` code fences.
        4. Do NOT include introductory text or explanations.
        5. Use double quotes for all JSON keys and string values.
        6. Do NOT add comments or trailing commas.
        7. Follow the exact JSON structure provided above.
        8. Ensure the output can be parsed directly using Jackson ObjectMapper.

        """,
                activity.getActivityType(),
                activity.getDuration(),
                activity.getCaloriesBurned(),
                activity.getAdditionalMetrics()
        );
    }

}