import { useState, useCallback } from 'react';

const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return '';
  }, [validationRules, values]);

  const validateAll = useCallback(() => {
    const newErrors = {};
    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateField, values, validationRules]);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [validateField, touched]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField, values]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    const isValid = validateAll();
    
    if (isValid) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    setIsSubmitting(false);
  }, [validateAll, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};

// Validation rules
export const validationRules = {
  required: (value) => !value ? 'This field is required' : '',
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value) ? 'Invalid email format' : '';
  },
  phone: (value) => {
    const phoneRegex = /^\d{10}$/;
    return value && !phoneRegex.test(value) ? 'Phone must be 10 digits' : '';
  },
  minLength: (min) => (value) => 
    value && value.length < min ? `Minimum ${min} characters required` : '',
  maxLength: (max) => (value) => 
    value && value.length > max ? `Maximum ${max} characters allowed` : '',
  password: (value) => {
    if (!value) return '';
    if (value.length < 6) return 'Password must be at least 6 characters';
    if (!/(?=.*[a-z])/.test(value)) return 'Password must contain lowercase letter';
    if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain uppercase letter';
    if (!/(?=.*\d)/.test(value)) return 'Password must contain a number';
    return '';
  },
  confirmPassword: (value, values) => 
    value !== values.password ? 'Passwords do not match' : ''
};

export default useFormValidation;