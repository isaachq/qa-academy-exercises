package config;

import java.util.LinkedHashMap;
import java.util.Map;

public final class Environment {
    public static final String BASE_URL =
            System.getenv().getOrDefault("BASE_URL", "https://qaacademyabc.xyz").replaceAll("/$", "");

    private Environment() {}

    public static String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(name + " is required. Copy .env.example to .env.");
        }
        return value.trim();
    }

    public static Map<String, String> automationHeaders() {
        Map<String, String> headers = new LinkedHashMap<>();
        String secret = System.getenv("VERCEL_AUTOMATION_BYPASS_SECRET");
        if (secret != null && !secret.isBlank()) {
            headers.put("x-vercel-protection-bypass", secret.trim());
            headers.put("x-vercel-set-bypass-cookie", "true");
        }
        return headers;
    }
}
