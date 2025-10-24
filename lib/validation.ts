// Validation constants
export const VALIDATION = {
  PAGE_TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  UPDATE_CONTENT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 5000,
  },
} as const;

/**
 * Sanitizes text input by trimming whitespace and removing null characters
 */
export function sanitizeText(text: string): string {
  return text.trim().replace(/\0/g, '');
}

/**
 * Validates page title
 */
export function validatePageTitle(title: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeText(title);

  if (sanitized.length < VALIDATION.PAGE_TITLE.MIN_LENGTH) {
    return { valid: false, error: 'Title is required' };
  }

  if (sanitized.length > VALIDATION.PAGE_TITLE.MAX_LENGTH) {
    return {
      valid: false,
      error: `Title must be ${VALIDATION.PAGE_TITLE.MAX_LENGTH} characters or less`,
    };
  }

  return { valid: true };
}

/**
 * Validates update content
 */
export function validateUpdateContent(content: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeText(content);

  if (sanitized.length < VALIDATION.UPDATE_CONTENT.MIN_LENGTH) {
    return { valid: false, error: 'Update content is required' };
  }

  if (sanitized.length > VALIDATION.UPDATE_CONTENT.MAX_LENGTH) {
    return {
      valid: false,
      error: `Update must be ${VALIDATION.UPDATE_CONTENT.MAX_LENGTH} characters or less`,
    };
  }

  return { valid: true };
}