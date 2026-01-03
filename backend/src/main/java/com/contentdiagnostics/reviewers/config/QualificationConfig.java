package com.contentdiagnostics.reviewers.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

/**
 * Configuration for reviewer qualification test.
 * Expected answers are configured via application properties.
 */
@Configuration
@ConfigurationProperties(prefix = "app.qualification")
@Getter
@Setter
public class QualificationConfig {

    /**
     * Minimum completion time in seconds to prevent cheating.
     */
    private int minCompletionTimeSeconds = 60;

    /**
     * Minimum percentage of correct answers required to pass (0.0 to 1.0).
     */
    private double passingThreshold = 0.80;

    /**
     * Expected answers for qualification test questions.
     * Key: question ID, Value: correct answer
     */
    private Map<String, String> expectedAnswers = new HashMap<>();

    /**
     * Check if a submission passes the qualification test.
     *
     * @param answers User's submitted answers
     * @param completionTimeSeconds Time taken to complete
     * @return true if the submission passes
     */
    public boolean evaluate(Map<String, String> answers, Double completionTimeSeconds) {
        // Check minimum completion time
        if (completionTimeSeconds != null && completionTimeSeconds < minCompletionTimeSeconds) {
            return false; // Too fast - likely cheating
        }

        // If no expected answers configured, use lenient mode (pass if answers provided)
        if (expectedAnswers == null || expectedAnswers.isEmpty()) {
            return answers != null && !answers.isEmpty();
        }

        // Count correct answers
        int correctCount = 0;
        int totalQuestions = expectedAnswers.size();

        for (Map.Entry<String, String> expected : expectedAnswers.entrySet()) {
            String userAnswer = answers.get(expected.getKey());
            if (userAnswer != null && expected.getValue().equalsIgnoreCase(userAnswer.trim())) {
                correctCount++;
            }
        }

        // Check if passing threshold is met
        double score = (double) correctCount / totalQuestions;
        return score >= passingThreshold;
    }
}
