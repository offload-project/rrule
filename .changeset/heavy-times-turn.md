---
"@offload-project/rrule": minor
---

Add `validate` function for checking RRULE and RRuleSet strings without throwing.

- New `validate(s, options?)` function that returns `{ valid: true }` or `{ valid: false, error: { message, cause } }`
- Accepts the same string formats and options as `rrulestr`
- Exported `ValidationResult`, `ValidationSuccess`, and `ValidationError` types
