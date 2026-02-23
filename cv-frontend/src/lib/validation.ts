/**
 * Validation utilities for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: true }; // Empty is valid (use required separately)
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);

  return {
    isValid,
    message: isValid ? undefined : 'Email không hợp lệ',
  };
}

/**
 * Validate phone number (Vietnamese format)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: true };
  }

  // Support various Vietnamese phone formats
  // Examples: 0123456789, +84123456789, 84123456789, (012) 345-6789
  const phoneRegex = /^(\+?84|0)?([0-9]{9,10})$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  const isValid = phoneRegex.test(cleanPhone);

  return {
    isValid,
    message: isValid ? undefined : 'Số điện thoại không hợp lệ',
  };
}

/**
 * Validate URL
 */
export function validateUrl(url: string): ValidationResult {
  if (!url) {
    return { isValid: true };
  }

  try {
    const urlObj = new URL(url);
    const isValid = ['http:', 'https:'].includes(urlObj.protocol);
    
    return {
      isValid,
      message: isValid ? undefined : 'URL không hợp lệ',
    };
  } catch {
    // Try adding https:// prefix
    try {
      new URL(`https://${url}`);
      return {
        isValid: true,
        message: undefined,
      };
    } catch {
      return {
        isValid: false,
        message: 'URL không hợp lệ',
      };
    }
  }
}

/**
 * Validate required field
 */
export function validateRequired(value: string): ValidationResult {
  const isValid = !!value?.trim();
  
  return {
    isValid,
    message: isValid ? undefined : 'Trường này là bắt buộc',
  };
}

/**
 * Validate min length
 */
export function validateMinLength(value: string, minLength: number): ValidationResult {
  if (!value) {
    return { isValid: true };
  }

  const isValid = value.length >= minLength;
  
  return {
    isValid,
    message: isValid ? undefined : `Tối thiểu ${minLength} ký tự`,
  };
}

/**
 * Validate max length
 */
export function validateMaxLength(value: string, maxLength: number): ValidationResult {
  if (!value) {
    return { isValid: true };
  }

  const isValid = value.length <= maxLength;
  
  return {
    isValid,
    message: isValid ? undefined : `Tối đa ${maxLength} ký tự`,
  };
}

/**
 * Combine multiple validators
 */
export function combineValidators(
  value: string,
  validators: ((value: string) => ValidationResult)[]
): ValidationResult {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.isValid) {
      return result;
    }
  }
  
  return { isValid: true };
}

/**
 * Get validator by field type
 */
export function getValidatorByFieldType(fieldType: string): ((value: string) => ValidationResult) | null {
  const validators: Record<string, (value: string) => ValidationResult> = {
    email: validateEmail,
    phone: validatePhone,
    url: validateUrl,
    website: validateUrl,
    linkedin: validateUrl,
    github: validateUrl,
  };

  return validators[fieldType] || null;
}
