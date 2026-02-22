import { validate } from '../src';

describe('validate', () => {
  describe('valid inputs', () => {
    it('validates a simple RRULE string', () => {
      const result = validate('FREQ=YEARLY;COUNT=3');
      expect(result.valid).toBe(true);
    });

    it('validates an RRULE with DTSTART', () => {
      const result = validate('DTSTART:19970902T090000Z\nRRULE:FREQ=YEARLY;COUNT=3');
      expect(result.valid).toBe(true);
    });

    it('validates a full ruleset string', () => {
      const result = validate(
        'DTSTART:19970902T090000Z\n' +
          'RRULE:FREQ=YEARLY;COUNT=6;BYDAY=TU,TH\n' +
          'EXRULE:FREQ=YEARLY;COUNT=3;BYDAY=TH\n' +
          'RDATE:19970904T090000Z\n' +
          'EXDATE:19970911T090000Z',
      );
      expect(result.valid).toBe(true);
    });

    it('validates with TZID', () => {
      const result = validate('DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=DAILY');
      expect(result.valid).toBe(true);
    });

    it('validates with options.dtstart provided', () => {
      const result = validate('RRULE:FREQ=WEEKLY;COUNT=3', {
        dtstart: new Date('1997-09-02T09:00:00Z'),
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('rejects empty string', () => {
      const result = validate('');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('Invalid empty string');
      }
    });

    it('rejects unsupported property', () => {
      const result = validate('DTSTART:19970902T090000Z\nVTODO:something');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('unsupported property');
      }
    });

    it('rejects unknown RRULE property', () => {
      const result = validate('RRULE:FREQ=YEARLY;BOGUSPROP=1');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain("Unknown RRULE property 'BOGUSPROP'");
      }
    });

    it('rejects invalid weekday string', () => {
      const result = validate('RRULE:FREQ=WEEKLY;BYDAY=XY');
      expect(result.valid).toBe(false);
    });

    it('rejects invalid UNTIL date format', () => {
      const result = validate('RRULE:FREQ=YEARLY;UNTIL=not-a-date');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('Invalid UNTIL value');
      }
    });

    it('rejects invalid frequency', () => {
      const result = validate('RRULE:FREQ=BOGUS');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('Invalid frequency');
      }
    });

    it('rejects unsupported RDATE parm', () => {
      const result = validate('DTSTART:19970902T090000Z\nRDATE;BOGUS=1:19970904T090000Z');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('unsupported RDATE/EXDATE parm');
      }
    });
  });

  describe('contract', () => {
    it('never throws', () => {
      expect(() => validate(null as unknown as string)).not.toThrow();
      expect(() => validate(undefined as unknown as string)).not.toThrow();
      expect(() => validate(123 as unknown as string)).not.toThrow();
    });

    it('returns error.cause as an Error instance', () => {
      const result = validate('');
      if (!result.valid) {
        expect(result.error.cause).toBeInstanceOf(Error);
      }
    });
  });
});
