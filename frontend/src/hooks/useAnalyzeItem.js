import { useState, useCallback } from 'react';
import { analyzeItemImage } from '../services/api';

/**
 * Hook to analyze an item image.
 * Keeps loading, error, and result state co-located.
 */
export function useAnalyzeItem() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const analyze = useCallback(async (imageUri, mimeType) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeItemImage(imageUri, mimeType);
      setResult(data);
      return data;
    } catch (err) {
      const message = err.message || 'Failed to analyze item. Please try again.';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return { analyze, isLoading, error, result, reset };
}
