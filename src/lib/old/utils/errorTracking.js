export const trackError = (error, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}] Error:`, error);
  }
  
  // In production, you could send to error tracking service
  // Example: Sentry, LogRocket, etc.
};

export const safeAsync = async (fn, fallback = null) => {
  try {
    return await fn();
  } catch (error) {
    trackError(error, 'safeAsync');
    return fallback;
  }
};
