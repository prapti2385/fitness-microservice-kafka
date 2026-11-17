package com.fitness.aiservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.Exceptions;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@Service
@Slf4j
public class GeminiService {
    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiurl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    // Tried in order. Override with gemini.api.models in ai-service.yaml (comma-separated).
    // Fastest/cheapest-to-succeed first; the Gemini 4 model is the last resort.
    @Value("${gemini.api.models:gemini-3.8-flash,gemini-3.5-flash,gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-3-flash-preview,gemini-4-argon}")
    private List<String> models;

    // Max time for one HTTP attempt.
    @Value("${gemini.api.attempt-timeout-seconds:20}")
    private long attemptTimeoutSeconds;

    // Max time for the whole fallback chain, so the UI (which polls for about 60 s) is not left waiting.
    @Value("${gemini.api.total-timeout-seconds:50}")
    private long totalTimeoutSeconds;

    public GeminiService(WebClient webClient) {
        this.webClient = webClient;
    }

    public String getRecommendations(String details) {
        long deadline = System.nanoTime() + Duration.ofSeconds(totalTimeoutSeconds).toNanos();
        List<String> failures = new ArrayList<>();

        for (String raw : models) {
            String model = raw.trim();
            if (model.isEmpty()) {
                continue;
            }
            long remainingMs = (deadline - System.nanoTime()) / 1_000_000;
            if (remainingMs <= 500) {
                failures.add("(time budget of " + totalTimeoutSeconds + "s used up before " + model + ")");
                break;
            }
            try {
                String response = callModel(model, details, remainingMs);
                if (!failures.isEmpty()) {
                    log.info("Gemini model {} succeeded after {} failed model(s): {}", model, failures.size(), failures);
                }
                return response;
            } catch (RuntimeException e) {
                Throwable cause = Exceptions.unwrap(e);
                String reason = describe(cause);
                failures.add(model + " -> " + reason);
                log.warn("Gemini model {} failed ({}), trying the next model", model, reason);
                if (isInvalidKey(cause)) {
                    // The same key is used for every model, so another model cannot help.
                    break;
                }
            }
        }
        throw new IllegalStateException("All Gemini models failed: " + failures);
    }

    private String callModel(String model, String details, long remainingMs) {
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "input", details
        );
        return webClient.post()
                .uri("/v1beta/interactions")
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", geminiApiKey.trim())
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(attemptTimeoutSeconds))      // per attempt
                .retryWhen(Retry.backoff(1, Duration.ofSeconds(1))       // one quick retry, transient errors only
                        .filter(GeminiService::isTransient)
                        .onRetryExhaustedThrow((spec, signal) -> signal.failure()))
                .timeout(Duration.ofMillis(remainingMs))                 // never exceed the overall budget
                .block();
    }

    // Worth retrying the same model: Google-side 5xx, timeouts, network errors.
    // 429 (rate limit or quota) is NOT retried here: the next model has its own limit, so move on.
    // 404 / 400 / 403 for a model: move on too, since that model may not exist or be allowed for this key.
    private static boolean isTransient(Throwable t) {
        if (t instanceof WebClientResponseException) {
            return ((WebClientResponseException) t).getStatusCode().value() >= 500;
        }
        return t instanceof TimeoutException || t instanceof WebClientRequestException;
    }

    private static boolean isInvalidKey(Throwable t) {
        if (t instanceof WebClientResponseException) {
            WebClientResponseException e = (WebClientResponseException) t;
            if (e.getStatusCode().value() == 401) {
                return true;
            }
            String body = e.getResponseBodyAsString();
            return body != null && (body.contains("API key not valid") || body.contains("API_KEY_INVALID"));
        }
        return false;
    }

    // Short, readable reason for the log summary. Never includes the API key.
    private static String describe(Throwable t) {
        if (t instanceof WebClientResponseException) {
            WebClientResponseException e = (WebClientResponseException) t;
            String body = e.getResponseBodyAsString();
            if (body != null && body.length() > 160) {
                body = body.substring(0, 160) + "...";
            }
            return e.getStatusCode().value() + " " + body;
        }
        return t.getClass().getSimpleName() + (t.getMessage() != null ? ": " + t.getMessage() : "");
    }
}