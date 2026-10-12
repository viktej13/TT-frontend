package com.smartcampus.scsms.service.impl;

import com.smartcampus.scsms.dto.LoginRequest;
import com.smartcampus.scsms.dto.RegisterRequest;
import com.smartcampus.scsms.dto.UserResponseDto;
import com.smartcampus.scsms.entity.Role;
import com.smartcampus.scsms.entity.User;
import com.smartcampus.scsms.exception.InvalidRequestException;
import com.smartcampus.scsms.repository.UserRepository;
import com.smartcampus.scsms.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();
    private final SecurityContextHolderStrategy securityContextHolderStrategy = SecurityContextHolder.getContextHolderStrategy();

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public UserResponseDto registerStudent(RegisterRequest request) {
        if (request == null) {
            throw new InvalidRequestException("Registration data cannot be null");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new InvalidRequestException("Passwords do not match");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new InvalidRequestException("Email address is already registered");
        }

        String studentId = request.getStudentId().trim();
        if (userRepository.existsByStudentId(studentId)) {
            throw new InvalidRequestException("Student ID is already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setStudentId(studentId);
        user.setEmail(email);
        user.setDepartment(request.getDepartment().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_STUDENT); // Strictly enforce STUDENT role for public registrations

        User saved = userRepository.save(user);
        return UserResponseDto.fromEntity(saved);
    }

    @Override
    public UserResponseDto login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        if (request == null || request.getEmail() == null || request.getPassword() == null) {
            throw new InvalidRequestException("Email and password are required");
        }

        String email = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContext context = securityContextHolderStrategy.createEmptyContext();
        context.setAuthentication(authentication);
        securityContextHolderStrategy.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidRequestException("User account not found"));

        return UserResponseDto.fromEntity(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDto getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }

        String email = auth.getName();
        return userRepository.findByEmail(email)
                .map(UserResponseDto::fromEntity)
                .orElse(null);
    }

    @Override
    public void logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            new SecurityContextLogoutHandler().logout(httpRequest, httpResponse, auth);
        }
        SecurityContextHolder.clearContext();
    }
}
