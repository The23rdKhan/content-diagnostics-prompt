package com.contentdiagnostics.billing.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.auth.entity.UserRole;
import com.contentdiagnostics.billing.entity.StripeEvent;
import com.contentdiagnostics.billing.repository.StripeEventRepository;
import com.contentdiagnostics.common.exception.ValidationException;
import com.contentdiagnostics.creators.entity.CreatorProfile;
import com.contentdiagnostics.creators.entity.PlanTier;
import com.contentdiagnostics.creators.repository.CreatorProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StripeService")
class StripeServiceTest {

    @Mock
    private StripeEventRepository stripeEventRepository;

    @Mock
    private CreatorProfileRepository creatorProfileRepository;

    @InjectMocks
    private StripeService stripeService;

    private User testCreator;
    private CreatorProfile creatorProfile;

    @BeforeEach
    void setUp() {
        testCreator = new User();
        testCreator.setId(UUID.randomUUID());
        testCreator.setEmail("creator@example.com");
        testCreator.setRole(UserRole.CREATOR);

        creatorProfile = new CreatorProfile();
        creatorProfile.setId(UUID.randomUUID());
        creatorProfile.setUser(testCreator);
        creatorProfile.setPlanTier(PlanTier.BASIC);
        creatorProfile.setStripeCustomerId("cus_test123");

        // Set configuration values
        ReflectionTestUtils.setField(stripeService, "stripeSecretKey", "sk_test_key");
        ReflectionTestUtils.setField(stripeService, "webhookSecret", "whsec_test");
    }

    @Nested
    @DisplayName("Webhook Idempotency")
    class WebhookIdempotency {

        @Test
        @DisplayName("should process new webhook event")
        void shouldProcessNewEvent() {
            String eventId = "evt_" + UUID.randomUUID().toString().replace("-", "");

            when(stripeEventRepository.existsByStripeEventId(eventId)).thenReturn(false);
            when(stripeEventRepository.save(any(StripeEvent.class))).thenAnswer(i -> i.getArgument(0));

            boolean processed = stripeService.processWebhookEvent(eventId, "checkout.session.completed", "{}");

            assertThat(processed).isTrue();

            ArgumentCaptor<StripeEvent> eventCaptor = ArgumentCaptor.forClass(StripeEvent.class);
            verify(stripeEventRepository).save(eventCaptor.capture());

            assertThat(eventCaptor.getValue().getStripeEventId()).isEqualTo(eventId);
            assertThat(eventCaptor.getValue().getEventType()).isEqualTo("checkout.session.completed");
            assertThat(eventCaptor.getValue().getProcessed()).isTrue();
        }

        @Test
        @DisplayName("should skip already processed event (idempotent)")
        void shouldSkipAlreadyProcessedEvent() {
            String eventId = "evt_" + UUID.randomUUID().toString().replace("-", "");

            when(stripeEventRepository.existsByStripeEventId(eventId)).thenReturn(true);

            boolean processed = stripeService.processWebhookEvent(eventId, "checkout.session.completed", "{}");

            assertThat(processed).isFalse();
            verify(stripeEventRepository, never()).save(any());
        }

        @Test
        @DisplayName("should store event metadata for audit")
        void shouldStoreEventMetadata() {
            String eventId = "evt_123";
            String eventType = "customer.subscription.updated";
            String payload = "{\"data\": {\"object\": {\"id\": \"sub_123\"}}}";

            when(stripeEventRepository.existsByStripeEventId(eventId)).thenReturn(false);
            when(stripeEventRepository.save(any(StripeEvent.class))).thenAnswer(i -> i.getArgument(0));

            stripeService.processWebhookEvent(eventId, eventType, payload);

            ArgumentCaptor<StripeEvent> eventCaptor = ArgumentCaptor.forClass(StripeEvent.class);
            verify(stripeEventRepository).save(eventCaptor.capture());

            StripeEvent saved = eventCaptor.getValue();
            assertThat(saved.getStripeEventId()).isEqualTo(eventId);
            assertThat(saved.getEventType()).isEqualTo(eventType);
            assertThat(saved.getPayload()).isEqualTo(payload);
            assertThat(saved.getProcessedAt()).isNotNull();
        }
    }

    @Nested
    @DisplayName("Subscription Event Handling")
    class SubscriptionEventHandling {

        @Test
        @DisplayName("should upgrade plan on subscription created")
        void shouldUpgradePlanOnSubscriptionCreated() {
            String eventId = "evt_sub_created";
            String payload = createSubscriptionPayload("sub_123", "price_professional", "active");

            when(stripeEventRepository.existsByStripeEventId(eventId)).thenReturn(false);
            when(stripeEventRepository.save(any(StripeEvent.class))).thenAnswer(i -> i.getArgument(0));
            when(creatorProfileRepository.findByStripeCustomerId("cus_test123"))
                .thenReturn(Optional.of(creatorProfile));
            when(creatorProfileRepository.save(any(CreatorProfile.class))).thenAnswer(i -> i.getArgument(0));

            stripeService.handleSubscriptionCreated(eventId, payload);

            ArgumentCaptor<CreatorProfile> profileCaptor = ArgumentCaptor.forClass(CreatorProfile.class);
            verify(creatorProfileRepository).save(profileCaptor.capture());

            assertThat(profileCaptor.getValue().getStripeSubscriptionId()).isEqualTo("sub_123");
        }

        @Test
        @DisplayName("should downgrade to basic on subscription cancelled")
        void shouldDowngradeOnCancellation() {
            creatorProfile.setPlanTier(PlanTier.PROFESSIONAL);
            creatorProfile.setStripeSubscriptionId("sub_123");

            String eventId = "evt_sub_deleted";
            String payload = createSubscriptionPayload("sub_123", "price_professional", "canceled");

            when(stripeEventRepository.existsByStripeEventId(eventId)).thenReturn(false);
            when(stripeEventRepository.save(any(StripeEvent.class))).thenAnswer(i -> i.getArgument(0));
            when(creatorProfileRepository.findByStripeSubscriptionId("sub_123"))
                .thenReturn(Optional.of(creatorProfile));
            when(creatorProfileRepository.save(any(CreatorProfile.class))).thenAnswer(i -> i.getArgument(0));

            stripeService.handleSubscriptionDeleted(eventId, payload);

            ArgumentCaptor<CreatorProfile> profileCaptor = ArgumentCaptor.forClass(CreatorProfile.class);
            verify(creatorProfileRepository).save(profileCaptor.capture());

            assertThat(profileCaptor.getValue().getPlanTier()).isEqualTo(PlanTier.BASIC);
            assertThat(profileCaptor.getValue().getStripeSubscriptionId()).isNull();
        }

        private String createSubscriptionPayload(String subscriptionId, String priceId, String status) {
            return String.format(
                "{\"data\": {\"object\": {\"id\": \"%s\", \"customer\": \"cus_test123\", " +
                "\"status\": \"%s\", \"items\": {\"data\": [{\"price\": {\"id\": \"%s\"}}]}}}}",
                subscriptionId, status, priceId
            );
        }
    }

    @Nested
    @DisplayName("Invoice Event Handling")
    class InvoiceEventHandling {

        @Test
        @DisplayName("should record successful payment")
        void shouldRecordSuccessfulPayment() {
            String eventId = "evt_invoice_paid";
            String payload = "{\"data\": {\"object\": {\"id\": \"in_123\", \"customer\": \"cus_test123\", " +
                "\"amount_paid\": 9900, \"status\": \"paid\"}}}";

            when(stripeEventRepository.existsByStripeEventId(eventId)).thenReturn(false);
            when(stripeEventRepository.save(any(StripeEvent.class))).thenAnswer(i -> i.getArgument(0));
            when(creatorProfileRepository.findByStripeCustomerId("cus_test123"))
                .thenReturn(Optional.of(creatorProfile));

            stripeService.handleInvoicePaid(eventId, payload);

            verify(stripeEventRepository).save(any(StripeEvent.class));
        }

        @Test
        @DisplayName("should handle payment failure gracefully")
        void shouldHandlePaymentFailure() {
            String eventId = "evt_invoice_failed";
            String payload = "{\"data\": {\"object\": {\"id\": \"in_123\", \"customer\": \"cus_test123\", " +
                "\"status\": \"open\", \"attempt_count\": 1}}}";

            when(stripeEventRepository.existsByStripeEventId(eventId)).thenReturn(false);
            when(stripeEventRepository.save(any(StripeEvent.class))).thenAnswer(i -> i.getArgument(0));
            when(creatorProfileRepository.findByStripeCustomerId("cus_test123"))
                .thenReturn(Optional.of(creatorProfile));

            stripeService.handleInvoicePaymentFailed(eventId, payload);

            verify(stripeEventRepository).save(any(StripeEvent.class));
            // Payment failure should be recorded but not throw exception
        }
    }

    @Nested
    @DisplayName("Checkout Session Handling")
    class CheckoutSessionHandling {

        @Test
        @DisplayName("should link customer ID on checkout completion")
        void shouldLinkCustomerOnCheckout() {
            String eventId = "evt_checkout_complete";
            String payload = "{\"data\": {\"object\": {\"id\": \"cs_123\", " +
                "\"customer\": \"cus_new123\", \"client_reference_id\": \"" + creatorProfile.getId() + "\", " +
                "\"mode\": \"subscription\", \"subscription\": \"sub_new123\"}}}";

            creatorProfile.setStripeCustomerId(null); // Not yet linked

            when(stripeEventRepository.existsByStripeEventId(eventId)).thenReturn(false);
            when(stripeEventRepository.save(any(StripeEvent.class))).thenAnswer(i -> i.getArgument(0));
            when(creatorProfileRepository.findById(creatorProfile.getId()))
                .thenReturn(Optional.of(creatorProfile));
            when(creatorProfileRepository.save(any(CreatorProfile.class))).thenAnswer(i -> i.getArgument(0));

            stripeService.handleCheckoutCompleted(eventId, payload);

            ArgumentCaptor<CreatorProfile> profileCaptor = ArgumentCaptor.forClass(CreatorProfile.class);
            verify(creatorProfileRepository).save(profileCaptor.capture());

            assertThat(profileCaptor.getValue().getStripeCustomerId()).isEqualTo("cus_new123");
            assertThat(profileCaptor.getValue().getStripeSubscriptionId()).isEqualTo("sub_new123");
        }

        @Test
        @DisplayName("should handle one-time payment checkout")
        void shouldHandleOneTimePayment() {
            String eventId = "evt_checkout_addon";
            String payload = "{\"data\": {\"object\": {\"id\": \"cs_456\", " +
                "\"customer\": \"cus_test123\", \"client_reference_id\": \"" + creatorProfile.getId() + "\", " +
                "\"mode\": \"payment\", \"metadata\": {\"addon_type\": \"extra_reviewers\", \"job_id\": \"job_123\"}}}}";

            when(stripeEventRepository.existsByStripeEventId(eventId)).thenReturn(false);
            when(stripeEventRepository.save(any(StripeEvent.class))).thenAnswer(i -> i.getArgument(0));
            when(creatorProfileRepository.findById(creatorProfile.getId()))
                .thenReturn(Optional.of(creatorProfile));

            stripeService.handleCheckoutCompleted(eventId, payload);

            verify(stripeEventRepository).save(any(StripeEvent.class));
            // Addon processing would be handled by addon-specific logic
        }
    }

    @Nested
    @DisplayName("Webhook Signature Validation")
    class WebhookSignatureValidation {

        @Test
        @DisplayName("should reject invalid webhook signature")
        void shouldRejectInvalidSignature() {
            String payload = "{\"id\": \"evt_123\"}";
            String invalidSignature = "invalid_signature";

            assertThatThrownBy(() -> stripeService.validateWebhookSignature(payload, invalidSignature))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("signature");
        }
    }

    @Nested
    @DisplayName("Customer Portal Session")
    class CustomerPortalSession {

        @Test
        @DisplayName("should require existing Stripe customer ID")
        void shouldRequireStripeCustomerId() {
            creatorProfile.setStripeCustomerId(null);

            when(creatorProfileRepository.findByUserId(testCreator.getId()))
                .thenReturn(Optional.of(creatorProfile));

            assertThatThrownBy(() -> stripeService.createPortalSession(testCreator, "http://localhost/return"))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("customer");
        }
    }
}
