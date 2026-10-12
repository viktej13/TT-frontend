package com.smartcampus.scsms.config;

import com.smartcampus.scsms.entity.Role;
import com.smartcampus.scsms.entity.User;
import com.smartcampus.scsms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

@Component
public class AdminAccountInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminAccountInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@campus.edu}")
    private String adminEmail;

    @Value("${app.admin.name:Campus Administrator}")
    private String adminName;

    @Value("${app.admin.password:}")
    private String configuredAdminPassword;

    public AdminAccountInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.existsByRole(Role.ROLE_ADMIN)) {
            log.info("Administrator account already present in database. Initial provisioning skipped.");
            return;
        }

        String initialPassword;
        boolean isGenerated = false;

        if (configuredAdminPassword != null && !configuredAdminPassword.trim().isEmpty()) {
            initialPassword = configuredAdminPassword.trim();
        } else {
            // Generate a secure one-time password if none provided via environment
            byte[] randomBytes = new byte[12];
            new SecureRandom().nextBytes(randomBytes);
            initialPassword = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
            isGenerated = true;
        }

        User adminUser = new User();
        adminUser.setFullName(adminName);
        adminUser.setStudentId(null);
        adminUser.setEmail(adminEmail.trim().toLowerCase());
        adminUser.setDepartment("Campus Administration");
        adminUser.setPassword(passwordEncoder.encode(initialPassword));
        adminUser.setRole(Role.ROLE_ADMIN);

        userRepository.save(adminUser);

        if (isGenerated) {
            log.warn("\n================================================================================\n" +
                     "[SCSMS SECURITY] INITIAL ADMINISTRATOR ACCOUNT PROVISIONED\n" +
                     "Email:    {}\n" +
                     "Password: {}\n" +
                     "Note: Store this password securely or configure APP_ADMIN_PASSWORD before launch.\n" +
                     "================================================================================",
                    adminEmail, initialPassword);
        } else {
            log.info("Initial administrator account '{}' provisioned using configured environment credentials.", adminEmail);
        }
    }
}
