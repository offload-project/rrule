### Changelog

## 2.9.0

### Minor Changes

- 21584c1: Add `validate` function for checking RRULE and RRuleSet strings without throwing.

  - New `validate(s, options?)` function that returns `{ valid: true }` or `{ valid: false, error: { message, cause } }`
  - Accepts the same string formats and options as `rrulestr`
  - Exported `ValidationResult`, `ValidationSuccess`, and `ValidationError` types

## 2.8.1

### Patch Changes

- 2a0bd87: Refactored the core recurrence-rule implementation to share query/caching logic across RRule and RRuleSet, while also fixing a few correctness/performance issues in iteration and caching behavior.

  ## Bug Fixes

  - Fixed removeFilteredDays accumulation bug

    - Was overwriting filtered on each iteration instead of accumulating. Only the last day's filter status was returned, causing sub-daily frequencies to
      potentially skip the wrong number of days when earlier days in the set were filtered out.

  - Fixed RRuleSet.clone() inverted noCache

    - Changed new RRuleSet(!!this.\_cache) to new RRuleSet(!this.\_cache). The constructor param is noCache, so the old code was enabling cache on uncached
      sets and vice versa.

  - Removed dead lno1wkst = 0 assignment
    - The value was assigned inside an if block but never read afterward. Changed declaration from let to const.

  ## Architecture

  - Extracted RRuleBase abstract class
    - Moved shared query methods (all, between, before, after, count) and caching logic into RRuleBase.
    - RRule extends RRuleBase — keeps options, \_iter, toString, toText, NLP methods.
    - RRuleSet extends RRuleBase — no longer extends RRule or calls super({}, noCache) with fake empty options.
    - Exported RRuleBase from src/index.ts so consumers can use instanceof RRuleBase for any rule-like object.
    - Updated test utilities to use RRuleBase for shared type checking.

  ## Performance

  - rrules()/exrules() — eliminated serialize+reparse

    - Was: this.\_rrule.map((e) => rrulestr(e.toString())) — serializes to RFC string then re-parses.
    - Now: this.\_rrule.map((e) => e.clone()) — direct clone, removed the rrulestr import entirely.

  - \_addRule/\_addDate — eliminated O(n) array allocation

    - Was: collection.map(String).includes(String(rrule)) — allocates a new array on every call.
    - Now: collection.some((r) => String(r) === str) — short-circuits without allocating.
    - Same pattern for \_addDate: .some((d) => d.getTime() === time) instead of .map(Number).includes(Number(date)).

  - Added cache size bounds (src/cache.ts)
    - Added MAX_CACHE_SIZE = 64 constant.
    - before/after/between caches now evict the oldest entry (FIFO) when the limit is reached, preventing unbounded memory growth on long-lived instances.

  ## Type Safety

  - Narrowed bynweekday to tuple type (src/types.ts)

    - Changed bynweekday: number[][] | null to bynweekday: [number, number][] | null in ParsedOptions, enabling safe destructuring without ! assertions in
      monthinfo.ts and parseoptions.ts.

  - Narrowed toText options to ParsedOptions (src/nlp/totext.ts)

    - Changed private options: Partial<Options> to private options: ParsedOptions, removing ~40 ! assertions on this.options.freq, this.options.interval,
      this.options.bymonthday, etc.

  - Added explicit return types to dateutil helpers (src/dateutil.ts)

    - getWeekday(): number, getMonthDays(): number, monthRange(): [number, number].
    - Eliminated downstream ! assertions in datetime.ts and yearinfo.ts where these return values were used.

  - Added explicit return type to extractName (src/rrulestr.ts)

    - Typed as { name: string; value: string } with default destructuring values, removing ! assertions on name and value.

  - Added default destructuring values in parseString (src/parsestring.ts)

    - const [key = '', value = ''] = attr.split('=') and similar patterns, eliminating undefined-possibility assertions.

  - Fixed Cache.all type (src/cache.ts)

    - Was: Date[] | Partial<IterArgs> | false — Partial<IterArgs> was never stored as all.
    - Now: Date[] | false.

  - Clarified cache miss check (src/cache.ts)
    - Changed if (!cached && this.all) to if (cached === false && this.all) — makes intent explicit for "not in cache" vs "cached as null".

  ## Code Cleanup

  Converted C-style loops to for...of across 7 files

  - monthinfo.ts, optionstostring.ts, parseoptions.ts, yearinfo.ts, iterset.ts, iter/index.ts, iter/poslist.ts — eliminates uncertain array-index !
    assertions.

  Removed dead code (src/iter/index.ts)

  - Deleted redundant interval === 0 check (already checked at function entry).

  Removed redundant instanceof runtime guards (src/rruleset.ts)

  - \_addRule had if (!(rrule instanceof RRule)) and \_addDate had if (!(date instanceof Date)) — parameters are already typed, so these were always true.
    Removed guards and corresponding tests.

  Fixed test parse() null safety (test/lib/utils.ts)

  - Added null guard for regex match result before destructuring. Simplified with Number() instead of intermediate variables.

  ## Features

  - toText() now includes start date (src/nlp/totext.ts)
    - When dtstart is explicitly set in rule options, toText() appends , starting [formatted date] to the output.
    - Example: "every 2 months on the 15th, starting February 18, 2026".
    - Rules without an explicit dtstart are unaffected.

  ## Tooling

  - Updated README (README.md)
    - Fixed stale badges, broken code examples, byeaster docs, wkst typo, LICENCE/LICENSE link, dev tooling (Biome), and documented new toText() starting
      date behavior.

## 2.8.0

- Bugfixes:
  - Don't minify `rrule.js` (minified version is still at `rrule.min.js`) ([#606](https://github.com/jkbrzt/rrule/pull/606))
  - Ignore tzid in NLP ([#528](https://github.com/jkbrzt/rrule/pull/528))
  - Remove unnecessary offset in daysBetween() ([#539](https://github.com/jkbrzt/rrule/pull/539))
- Convert test suite from mocha to jest ([#605](https://github.com/jkbrzt/rrule/pull/605))
- Export `ALL_WEEKDAYS` ([#591](https://github.com/jkbrzt/rrule/pull/591))
- Support weekly by hour texts ([#590](https://github.com/jkbrzt/rrule/pull/590))

- 2.7.2 (2023-02-10)

  - Bugfixes:
    - Fix rezonedDate ([#523](https://github.com/jakubroztocil/rrule/issues/523))
    - Export datetime ([#551](https://github.com/jakubroztocil/rrule/issues/551))
    - Fixes types for `before()` and `after()` ([#560](https://github.com/jakubroztocil/rrule/issues/560))
  - Update README (https://github.com/jakubroztocil/rrule/pull/543)

- 2.7.1 (2022-07-10)

  - Internal:
    - Upgrade build dependencies (#515)
    - Migrate from tslint to eslint (#514)
    - Fix precommit & lint warnings (#519)
    - Fix invalid date formats in tests (#517)
  - Remove default exports (#513)
  - Point to esm correctly (#516)

- 2.7.0 (2022-06-05)

  - Features:
    - **BREAKING CHANGE** Removes default export in favor of named exports
    - Removes Luxon dependency (#508)

- 2.6.8 (2021-02-04)

  - Bugfixes:
    - Solve circular imports (#444)

- 2.6.6 (2020-08-23)

  - Bugfixes:
    - Fixed broken npm package (#417)

- 2.6.5 (2020-08-23)
  - Bugfixes:
    - `luxon`-less binary should not contain any `luxon` imports (#410)
    - Fixed `toText` pluralization of “minutes“ (#415)
- 2.6.4 (2019-12-18)
  - Bugfixes:
    - Calculating series with unknown timezones will produce infinite loop (#320)
  - Internal:
    - Upgrade build dependencies
- 2.6.3 (2019-11-24)
  - Features
    - Allow passing `WeekdayStr` to `byweekday` like the types suggest is possible (#371)
- 2.6.2 (2019-06-08)
  - Features
    - Allow two digits for `BYDAY` (#330)
    - Add a quick way to format `until` in `toText` (#313)
    - Add support for parsing an rrule string without frequency (#339)
    - Add getters for `rrules`, `exrules`, `rdates`, `exdates` (#347)
- 2.6.0 (2019-01-03)
  - Bugfixes:
    - Fix sourcemap structure (#303)
- 2.5.6 (2018-09-30)
  - Bugfixes:
    - Validate date inputs (#281)
- 2.5.5 (2018-09-06)
  - Bugfixes:
    - Don't emit `RDATE;TZID=UTC` for rdates
- 2.5.3 (2018-09-06)
  - Bugfixes:
    - Prevented emitting `DTSTART;TZID=UTC` when UTC is explicitly set as tzid
- 2.5.2 (2018-09-05)
  - Bugfixes:
    - Permitted RRuleSets with no rrules to have tzid
- 2.5.1 (2018-09-02)
  - Bugfixes:
    - Conformed output & parsing to RFC 5545 (#295)
- 2.4.1 (2018-08-16)
  - Features:
    - Added codecov (#265)
  - Bugfixes:
    - Fixed RRULE parsing issue (#266)
- 2.4.0 (2018-08-16)
  - Features:
    - Implement `TZID` support (#38, #261)
  - Bugfixes:
    - Fixed an error in Typescript output (#264)
- 2.3.6 (2018-08-14)
  - Bugfixes:
    - Point package.json to es5-compiled bundle (#260)
- 2.3.5 (2018-08-14)
  - Features:
    - Return text "every day" when all days are selected
  - Bugfixes:
    - Sort monthdays correctly from toText() (#101)
    - Accept 0 as a valid monthday/weekday value (#153)
    - Support 3-digit years (#202)
- 2.3.4 (2018-08-10)
  - Fixed support for eastern hemisphere timezones (#247)
- 2.3.3 (2018-08-08)
  - Fixed typescript error (#244)
- 2.3.2 (2018-08-07)
  - Fixed deploy on npm (#239)
- 2.3.0 (2018-08-06)
  - Converted to [Typescript](https://www.typescriptlang.org/) (#229)
  - Add es5 and es6 distributions
  - Fixed a bug where recurrences in DST were 1 hour off if the host system used DST (#233)
  - Fixed numeric handling of weekday strings
- 2.2.8 (2018-02-16)
  - Added `fromText()` and `toText()` support for rules with `RRule.MINUTELY` frequency.
  - Added support for `VALUE=DATE` as a `RDATE` param.
  - Added typescript definitions.
  - Merged in the now obsolete `arolson101/rrule` fork (many thanks to @arolson101).
  - Fixed `RRule` mutating passed-in `options` in some cases.
  - Fixed unexpected results with dates lower than 1970.
  - Fixed `RRule.DAILY` frequency when only 1 `BYHOUR` is provided.
  - Fixed the internal `isLeapYear()` to only accept integers instead of relying on `instanceof` to check the parameter type.
- 2.2.0 (2017-03-11)
  - Added support `RRuleSet`, which allows more complex recurrence setups,
    mixing multiple rules, dates, exclusion rules, and exclusion dates.
  - Added Millisecond precision
    - Millisecond offset extracted from `dtstart` (`dtstart.getTime() % 1000`)
    - Each recurrence is returned with the same offset
  - Added some NLP support for hourly and byhour.
  - Fixed export in nlp.js.
- 2.1.0
  - Removed dependency on Underscore.js (thanks, @gsf).
  - Various small bugfixes and improvements.
- 2.0.1
  - Added bower.json.
- 2.0.0 (2013-07-16)
  - Fixed a February 28-related issue.
  - More flexible, backwards-incompatible API:
    - `freq` is now `options.freq`.
    - `options.cache` is now `noCache`.
    - `iterator` has to return `true`
    - `dtstart` and `options` arguments removed from `RRule.fromString`
      (use `RRule.parseString` and modify `options` manually instead).
    - `today` argument removed from `Rule.prototype.toText`
      (never actually used).
    - `rule.toString()` now includes `DTSTART` (if explicitly specified
      in `options`).
    - Day constants `.clone` is now `.nth`, eg. `RRule.FR.nth(-1)`
      (last Friday).
  - Added `RRule.parseString`
  - Added `RRule.parseText`
  - Added `RRule.optionsToString`
- 1.1.0 (2013-05-21)
  - Added a [demo app](http://jakubroztocil.github.io/rrule/).
  - Handle dates in `UNTIL` in `RRule.fromString`.
  - Added support for RequireJS.
  - Added `options` argument to `RRule.fromString`.
- 1.0.1 (2013-02-26)
  - Fixed leap years (thanks @jessevogt)
- 1.0.0 (2013-01-24)
  - Fixed timezone offset issues related to DST (thanks @evro).
- 1.0.0-beta (2012-08-15)
  - Initial public release.
