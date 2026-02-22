import { type RRuleStrOptions, rrulestr } from './parse/rrulestr';

export interface ValidationSuccess {
  valid: true;
}

export interface ValidationError {
  valid: false;
  error: {
    message: string;
    cause?: Error;
  };
}

export type ValidationResult = ValidationSuccess | ValidationError;

export function validate(s: string, options?: Partial<RRuleStrOptions>): ValidationResult {
  try {
    rrulestr(s, options);
    return { valid: true };
  } catch (e) {
    const cause = e instanceof Error ? e : new Error(String(e));
    return {
      valid: false,
      error: {
        message: cause.message,
        cause,
      },
    };
  }
}
