'use client';

import * as React from 'react';
import { EnhancedInput, EnhancedInputProps } from './enhanced-input';
import { ValidationMessage } from './validation-message';
import { ValidationResult, validateEmail, validatePhone, validateRequired, validateUrl } from '@/lib/validation';

export interface ValidatedInputProps extends Omit<EnhancedInputProps, 'error' | 'success'> {
  validationType?: 'email' | 'phone' | 'url' | 'required' | 'none';
  customValidator?: (value: string) => ValidationResult;
  onValidationChange?: (isValid: boolean) => void;
  showValidationMessage?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  (
    {
      validationType = 'none',
      customValidator,
      onValidationChange,
      showValidationMessage = true,
      validateOnBlur = true,
      validateOnChange = false,
      value,
      onBlur,
      onChange,
      ...props
    },
    ref
  ) => {
    const [validationResult, setValidationResult] = React.useState<ValidationResult>({ isValid: true });
    const [hasBlurred, setHasBlurred] = React.useState(false);
    const [hasChanged, setHasChanged] = React.useState(false);

    const validate = React.useCallback(
      (inputValue: string): ValidationResult => {
        if (customValidator) {
          return customValidator(inputValue);
        }

        if (validationType === 'none') {
          return { isValid: true };
        }

        switch (validationType) {
          case 'email':
            return validateEmail(inputValue);
          case 'phone':
            return validatePhone(inputValue);
          case 'url':
            return validateUrl(inputValue);
          case 'required':
            return validateRequired(inputValue);
          default:
            return { isValid: true };
        }
      },
      [validationType, customValidator]
    );

    React.useEffect(() => {
      const shouldValidate = validateOnChange ? hasChanged : hasBlurred;
      
      if (shouldValidate || value) {
        const result = validate(String(value || ''));
        setValidationResult(result);
        onValidationChange?.(result.isValid);
      }
    }, [value, validate, onValidationChange, hasBlurred, hasChanged, validateOnChange]);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setHasBlurred(true);
      if (validateOnBlur) {
        const result = validate(e.target.value);
        setValidationResult(result);
        onValidationChange?.(result.isValid);
      }
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasChanged(true);
      if (validateOnChange) {
        const result = validate(e.target.value);
        setValidationResult(result);
        onValidationChange?.(result.isValid);
      }
      onChange?.(e);
    };

    const shouldShowValidation = (validateOnChange && hasChanged) || (validateOnBlur && hasBlurred);
    const showError = !validationResult.isValid && shouldShowValidation;
    const showSuccess = validationResult.isValid && shouldShowValidation && value;

    return (
      <div>
        <EnhancedInput
          ref={ref}
          value={value}
          error={showError ? validationResult.message : undefined}
          success={!!showSuccess}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        {showValidationMessage && showError && (
          <ValidationMessage message={validationResult.message} type="error" />
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';

export { ValidatedInput };
