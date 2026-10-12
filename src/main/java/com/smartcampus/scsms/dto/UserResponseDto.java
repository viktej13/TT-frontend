package com.smartcampus.scsms.dto;

import com.smartcampus.scsms.entity.Role;
import com.smartcampus.scsms.entity.User;

public class UserResponseDto {

    private Long id;
    private String fullName;
    private String studentId;
    private String email;
    private String department;
    private Role role;
    private String roleDisplayName;

    public UserResponseDto() {
    }

    public static UserResponseDto fromEntity(User user) {
        if (user == null) {
            return null;
        }
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setStudentId(user.getStudentId());
        dto.setEmail(user.getEmail());
        dto.setDepartment(user.getDepartment());
        dto.setRole(user.getRole());
        dto.setRoleDisplayName(user.getRole() == Role.ROLE_ADMIN ? "Administrator" : "Student");
        return dto;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getRoleDisplayName() {
        return roleDisplayName;
    }

    public void setRoleDisplayName(String roleDisplayName) {
        this.roleDisplayName = roleDisplayName;
    }
}
