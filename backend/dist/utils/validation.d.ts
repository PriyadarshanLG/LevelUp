export interface RegisterValidation {
    name: string;
    email: string;
    password: string;
}
export interface LoginValidation {
    email: string;
    password: string;
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export declare const validateRegistration: (data: RegisterValidation) => ValidationResult;
export declare const validateLogin: (data: LoginValidation) => ValidationResult;
export declare const sanitizeUserInput: (input: string) => string;
export declare const isEmailDomainAllowed: (email: string) => boolean;
