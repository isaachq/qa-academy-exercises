package config;

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
}
