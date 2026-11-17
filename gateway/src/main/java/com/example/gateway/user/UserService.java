
package com.example.gateway.user;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class UserService {

    private final WebClient userServiceWebClient;

    public UserService(WebClient userServiceWebClient) {
        this.userServiceWebClient = userServiceWebClient;
    }

    public Mono<UserResponse> registerUser(RegisterRequest registerRequest) {

        log.info("Calling User Registration for {}",
                registerRequest.getEmail());

        return userServiceWebClient.post()
                .uri("/api/users/register")
                .bodyValue(registerRequest)
                .retrieve()
                .bodyToMono(UserResponse.class)
                .doOnError(error ->
                        log.error("User registration failed: {}",
                                error.getMessage()));
    }

    public Mono<Boolean> validateUser(String userId) {

        return userServiceWebClient.get()
                .uri("/api/users/{userId}/validate", userId)
                .retrieve()
                .bodyToMono(Boolean.class)
                .onErrorResume(WebClientResponseException.class, e -> {

                    if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                        log.info("User not found: {}", userId);
                        return Mono.just(false);
                    }

                    log.error("User validation failed for {}: {}",
                            userId, e.getMessage());

                    return Mono.error(e);
                });
    }
}
