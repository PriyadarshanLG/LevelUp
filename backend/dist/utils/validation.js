"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmailDomainAllowed = exports.sanitizeUserInput = exports.validateLogin = exports.validateRegistration = void 0;
const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const PASSWORD_MIN_LENGTH = 6;
const validateName = (name) => {
    const errors = [];
    if (!name || name.trim().length === 0) {
        errors.push('Name is required');
    }
    else if (name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    else if (name.trim().length > 50) {
        errors.push('Name cannot be more than 50 characters');
    }
    return errors;
};
const validateEmail = (email) => {
    const errors = [];
    if (!email || email.trim().length === 0) {
        errors.push('Email is required');
    }
    else if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
        errors.push('Please provide a valid email address');
    }
    return errors;
};
const validatePassword = (password) => {
    const errors = [];
    if (!password) {
        errors.push('Password is required');
    }
    else if (password.length < PASSWORD_MIN_LENGTH) {
        errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
    }
    else if (password.length > 128) {
        errors.push('Password cannot be more than 128 characters');
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    if (password.length >= 8) {
        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            errors.push('For stronger security, use uppercase, lowercase, and numbers');
        }
    }
    return errors;
};
const validateRegistration = (data) => {
    const errors = [];
    errors.push(...validateName(data.name));
    errors.push(...validateEmail(data.email));
    errors.push(...validatePassword(data.password));
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateRegistration = validateRegistration;
const validateLogin = (data) => {
    const errors = [];
    errors.push(...validateEmail(data.email));
    if (!data.password || data.password.trim().length === 0) {
        errors.push('Password is required');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateLogin = validateLogin;
const sanitizeUserInput = (input) => {
    if (!input)
        return '';
    return input
        .trim()
        .replace(/[<>]/g, '')
        .substring(0, 1000);
};
exports.sanitizeUserInput = sanitizeUserInput;
const isEmailDomainAllowed = (email) => {
    const blockedDomains = [
        'tempmail.org',
        '10minutemail.com',
        'guerrillamail.com'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain)
        return false;
    return !blockedDomains.includes(domain);
};
exports.isEmailDomainAllowed = isEmailDomainAllowed;
