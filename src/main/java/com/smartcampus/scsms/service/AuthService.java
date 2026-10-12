package com.smartcampus.scsms.service;

import com.smartcampus.scsms.dto.LoginRequest;
import com.smartcampus.scsms.dto.RegisterRequest;
import com.smartcampus.scsms.dto.UserResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {

    UserResponseDto registerStudent(RegisterRequest request);

    UserResponseDto login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse);

    UserResponseDto getCurrentUser();

    void logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse);
}
