
package com.example.gateway;

import com.example.gateway.user.RegisterRequest;
import com.example.gateway.user.UserService;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class KeycloakUserSyncFilter implements WebFilter {

    private final UserService userService;

    public KeycloakUserSyncFilter(UserService userService) {
        this.userService = userService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange,
                             WebFilterChain chain) {

        String token = exchange.getRequest()
                .getHeaders()
                .getFirst("Authorization");

        if (token == null || !token.startsWith("Bearer ")) {
            return chain.filter(exchange);
        }

        RegisterRequest registerRequest = getUserDetails(token);

        if (registerRequest == null ||
                registerRequest.getKeycloakId() == null) {
            log.error("Could not extract user details from JWT");
            return Mono.error(
                    new IllegalArgumentException("Invalid JWT user details")
            );
        }

        // Get the user's identity from the JWT
        String userId = registerRequest.getKeycloakId();

        return userService.validateUser(userId)
                .flatMap(exists -> {

                    if (!exists) {
                        log.info("New user detected. Registering: {}", userId);

                        return userService.registerUser(registerRequest)
                                .then();
                    }

                    log.info("User already exists, skipping sync");
                    return Mono.empty();
                })
                .then(Mono.defer(() -> {

                    ServerWebExchange mutatedExchange =
                            exchange.mutate()
                                    .request(builder ->
                                            builder.headers(headers ->
                                                    headers.set("X-User-ID", userId)))
                                    .build();

                    return chain.filter(mutatedExchange);
                }));
    }

    private RegisterRequest getUserDetails(String token) {

        try {
            String tokenWithoutBearer = token.substring(7).trim();

            SignedJWT signedJWT =
                    SignedJWT.parse(tokenWithoutBearer);

            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

            RegisterRequest request = new RegisterRequest();

            request.setEmail(claims.getStringClaim("email"));
            request.setFirstName(claims.getStringClaim("given_name"));
            request.setLastName(claims.getStringClaim("family_name"));
            request.setKeycloakId(claims.getSubject());
            request.setPassword("keycloak-managed-user");

            return request;

        } catch (Exception e) {
            log.error("Unable to extract user details from JWT", e);
            return null;
        }
    }
}
