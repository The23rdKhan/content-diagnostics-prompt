package com.contentdiagnostics.common.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cache configuration for the application.
 * Uses simple in-memory caching for plan and bundle lookups.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String PLANS_CACHE = "plans";
    public static final String CREDIT_BUNDLES_CACHE = "creditBundles";

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(PLANS_CACHE, CREDIT_BUNDLES_CACHE);
    }
}
