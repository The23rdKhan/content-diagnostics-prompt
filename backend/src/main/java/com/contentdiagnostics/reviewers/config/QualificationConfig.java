package com.contentdiagnostics.reviewers.config;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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
     * Maximum number of attempts allowed.
     */
    private int maxAttempts = 3;

    /**
     * Cooldown period in hours before retry after failure.
     */
    private int retryCooldownHours = 24;

    /**
     * Expected answers for qualification test questions.
     * Key: question ID, Value: correct answer
     */
    private Map<String, String> expectedAnswers = new HashMap<>();

    /**
     * Test questions with their options.
     */
    private List<Question> questions = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Question {
        private String id;
        private String text;
        private List<String> options;
        private String answer; // Correct answer
    }

    /**
     * Get expected answers map from questions (for backward compatibility).
     */
    public Map<String, String> getExpectedAnswersFromQuestions() {
        Map<String, String> answers = new HashMap<>();
        for (Question q : questions) {
            if (q.getId() != null && q.getAnswer() != null) {
                answers.put(q.getId(), q.getAnswer());
            }
        }
        // Merge with explicitly set expectedAnswers
        answers.putAll(expectedAnswers);
        return answers;
    }

    /**
     * Evaluate a submission and return detailed results.
     */
    public EvaluationResult evaluateDetailed(Map<String, String> answers, Double completionTimeSeconds) {
        Map<String, String> expected = getExpectedAnswersFromQuestions();
        int totalQuestions = expected.isEmpty() ? 1 : expected.size();
        int correctCount = 0;
        boolean tooFast = false;

        // Check minimum completion time
        if (completionTimeSeconds != null && completionTimeSeconds < minCompletionTimeSeconds) {
            tooFast = true;
        }

        // If no expected answers configured, use lenient mode
        if (expected.isEmpty()) {
            boolean passed = answers != null && !answers.isEmpty() && !tooFast;
            return new EvaluationResult(
                    passed,
                    passed ? 1.0 : 0.0,
                    passed ? 1 : 0,
                    1,
                    tooFast
            );
        }

        // Count correct answers
        for (Map.Entry<String, String> exp : expected.entrySet()) {
            String userAnswer = answers.get(exp.getKey());
            if (userAnswer != null && exp.getValue().equalsIgnoreCase(userAnswer.trim())) {
                correctCount++;
            }
        }

        double score = (double) correctCount / totalQuestions;
        boolean passed = score >= passingThreshold && !tooFast;

        return new EvaluationResult(passed, score, correctCount, totalQuestions, tooFast);
    }

    /**
     * Check if a submission passes the qualification test (legacy method).
     */
    public boolean evaluate(Map<String, String> answers, Double completionTimeSeconds) {
        return evaluateDetailed(answers, completionTimeSeconds).passed();
    }

    /**
     * Result of evaluating a qualification submission.
     */
    public record EvaluationResult(
            boolean passed,
            double score,
            int correctCount,
            int totalQuestions,
            boolean tooFast
    ) {}
}
