package com.smartcampus.scsms.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties, Environment env) {
        String databaseUrl = env.getProperty("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.trim().isEmpty()) {
            databaseUrl = System.getenv("DATABASE_URL");
        }

        if (databaseUrl != null && !databaseUrl.trim().isEmpty() &&
                (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
            log.info("Detected cloud PostgreSQL DATABASE_URL. Converting to Spring Boot JDBC format...");
            try {
                URI uri = new URI(databaseUrl.trim());
                String userInfo = uri.getUserInfo();
                String username = properties.getUsername();
                String password = properties.getPassword();

                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                } else if (userInfo != null) {
                    username = userInfo;
                }

                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath(); // e.g. /dbsmartcampus
                if (path == null || path.isEmpty() || path.equals("/")) {
                    path = "/smart_campus_db";
                }

                StringBuilder jdbcUrl = new StringBuilder();
                jdbcUrl.append("jdbc:postgresql://").append(uri.getHost()).append(":").append(port).append(path);

                if (uri.getQuery() != null && !uri.getQuery().isEmpty()) {
                    jdbcUrl.append("?").append(uri.getQuery());
                }

                log.info("Configured PostgreSQL JDBC target host: {}:{} (database: {})",
                        uri.getHost(), port, path.replace("/", ""));

                HikariConfig hikariConfig = new HikariConfig();
                hikariConfig.setJdbcUrl(jdbcUrl.toString());
                hikariConfig.setUsername(username);
                hikariConfig.setPassword(password);
                hikariConfig.setDriverClassName("org.postgresql.Driver");
                hikariConfig.setMaximumPoolSize(10);
                hikariConfig.setMinimumIdle(2);
                hikariConfig.setConnectionTimeout(20000);
                hikariConfig.setIdleTimeout(300000);
                return new HikariDataSource(hikariConfig);
            } catch (Exception ex) {
                log.error("Unable to parse DATABASE_URL ({}). Falling back to standard properties: {}",
                        ex.getClass().getSimpleName(), ex.getMessage());
            }
        }

        // Standard DataSource initialization via application.properties or SPRING_DATASOURCE_URL
        return properties.initializeDataSourceBuilder().build();
    }
}
