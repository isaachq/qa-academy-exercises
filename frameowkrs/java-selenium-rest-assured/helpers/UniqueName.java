package helpers;

import java.util.UUID;

public final class UniqueName {
    private UniqueName() {}

    public static String product() {
        return "e2e-java-selenium-" + System.currentTimeMillis() + "-"
                + UUID.randomUUID().toString().substring(0, 6);
    }
}
