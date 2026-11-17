package com.fitness.userservice.services;

import com.fitness.userservice.UserRepository;
import com.fitness.userservice.dto.RegisterRequest;
import com.fitness.userservice.dto.UserResponse;
import com.fitness.userservice.models.User;
import lombok.AllArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;

@Service

public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public @Nullable UserResponse register(RegisterRequest request) {
        if(userRepository.existsByEmail(request.getEmail())) {
            User existingUser = userRepository.findByEmail(request.getEmail());
            UserResponse userResponse = new UserResponse();
            userResponse.setId(existingUser.getId());
            userResponse.setPassword(existingUser.getPassword());
            userResponse.setEmail(existingUser.getEmail());
            userResponse.setFirstName(existingUser.getFirstName());
            userResponse.setLastName(existingUser.getLastName());
            userResponse.setCreatedAt(existingUser.getCreatedAt());
            userResponse.setUpdatedAt(existingUser.getUpdatedAt());
            userResponse.setKeycloakId(existingUser.getKeycloakId());

            return userResponse;
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPassword(request.getPassword());
        user.setKeycloakId(request.getKeycloakId());

        User savedUser = userRepository.save(user);
        UserResponse userResponse = new UserResponse();
        userResponse.setId(savedUser.getId());
        userResponse.setPassword(savedUser.getPassword());
        userResponse.setEmail(savedUser.getEmail());
        userResponse.setFirstName(savedUser.getFirstName());
        userResponse.setLastName(savedUser.getLastName());
        userResponse.setCreatedAt(savedUser.getCreatedAt());
        userResponse.setUpdatedAt(savedUser.getUpdatedAt());

        return userResponse;
    }

    public @Nullable UserResponse getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setKeycloakId(user.getKeycloakId());
        userResponse.setPassword(user.getPassword());
        userResponse.setEmail(user.getEmail());
        userResponse.setFirstName(user.getFirstName());
        userResponse.setLastName(user.getLastName());
        userResponse.setCreatedAt(user.getCreatedAt());
        userResponse.setUpdatedAt(user.getUpdatedAt());

        return userResponse;
    }

    public @Nullable Boolean existByUserId(String userId) {
        return userRepository.existsByKeycloakId(userId);
    }
}
