/**
 * Category Services API Helper
 * Optimized API calls for category services with caching and error handling
 */

const API_BASE_URL = 'https://ghaimcenter.com/laravel/api';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Simple in-memory cache
const cache = new Map();

/**
 * Create a cache key for the request
 */
const createCacheKey = (endpoint, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${endpoint}?${sortedParams}`;
};

/**
 * Check if cached data is still valid
 */
const isCacheValid = (cachedData) => {
  if (!cachedData) return false;
  return Date.now() - cachedData.timestamp < CACHE_DURATION;
};

/**
 * Fetch data with caching and error handling
 */
export const fetchWithCache = async (endpoint, params = {}, options = {}) => {
  const cacheKey = createCacheKey(endpoint, params);
  const cachedData = cache.get(cacheKey);

  // Return cached data if valid
  if (cachedData && isCacheValid(cachedData)) {
    console.log('📦 Returning cached data for:', cacheKey);
    return cachedData.data;
  }

  try {
    const url = new URL(`${API_BASE_URL}/${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });

    console.log('🌐 Fetching data from:', url.toString());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the successful response
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    console.log('✅ Data fetched and cached successfully');
    return data;

  } catch (error) {
    console.error('❌ API Error:', error);
    
    // Return cached data even if expired in case of network error
    if (cachedData) {
      console.log('⚠️ Returning expired cached data due to network error');
      return cachedData.data;
    }
    
    throw error;
  }
};

/**
 * Fetch services for a specific category
 */
export const fetchCategoryServices = async (categoryId) => {
  if (!categoryId) {
    throw new Error('Category ID is required');
  }

  return await fetchWithCache('clinics/services', {
    category_id: categoryId
  });
};

/**
 * Fetch category information
 */
export const fetchCategoryInfo = async (categoryId) => {
  if (!categoryId) {
    throw new Error('Category ID is required');
  }

  return await fetchWithCache('clinics/categories', {
    id: categoryId
  });
};

/**
 * Clear cache for specific endpoint or all cache
 */
export const clearCache = (endpoint = null) => {
  if (endpoint) {
    // Clear specific endpoint cache
    for (const [key] of cache) {
      if (key.startsWith(endpoint)) {
        cache.delete(key);
      }
    }
    console.log(`🗑️ Cleared cache for endpoint: ${endpoint}`);
  } else {
    // Clear all cache
    cache.clear();
    console.log('🗑️ Cleared all cache');
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;

  for (const [, value] of cache) {
    if (isCacheValid(value)) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  }

  return {
    totalEntries: cache.size,
    validEntries,
    expiredEntries,
    cacheHitRate: validEntries / cache.size || 0
  };
};

/**
 * Preload category services for better performance
 */
export const preloadCategoryServices = async (categoryIds) => {
  const promises = categoryIds.map(categoryId => 
    fetchCategoryServices(categoryId).catch(error => {
      console.warn(`Failed to preload category ${categoryId}:`, error);
      return null;
    })
  );

  const results = await Promise.allSettled(promises);
  const successful = results.filter(result => result.status === 'fulfilled').length;
  
  console.log(`🚀 Preloaded ${successful}/${categoryIds.length} categories`);
  return results;
};
