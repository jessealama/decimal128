# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [12.0.0] - 2024-04-10

### Removed

-   The `normalize` option for `lessThan` and `equals` has been removed. The comparison is now always done on the mathematical value.

## [11.2.0] - 2024-03-29

### Changed

-   The Decimal128 constructor now accepts BigInt arguments as well as safe integer Numbers

## [11.1.0] - 2024-03-29

### Changed

-   For `lessThan` and `equals`: the property of the (optional) second argument `total` has been renamed to `normalize`

## [11.0.0] - 2024-03-26

### Added

-   `valueOf` throws unconditioanlly to prevents any kind of mixing of Decimal128 objects with other JS values
-   `lessThan` to determine whether a Decimal128 is strictly less than another Decimal128
-   `equals` to determine whether a Decimal128 value is mathematically equal to another one

### Removed

-   `cmp` has been removed in favor of `lessThan` and `equals` for a nicer API

## [10.2.1] - 2024-03-22

No code changes. A few more examples of `cmp` in action were added to the test suite.

## [10.2.0] - 2024-03-21

### Added

-   `abs` method for computing absolute value

## [10.0.0] - 2024-01-30

### Changed

-   Added an option to `cmp` to normalize values values before comparison (default is `true`, i.e., compare mathematical values).

### Removed

-   `normalize` method (can now be safely defined in user space as `new Decimal128(x.toString())`.
-   Option to normalize strings in the constructor (we now accept the given digit string as-is)

## [9.1.0] - 2024-01-26

### Added

-   Restore possibility to specify rounding mode in arithmetic operations and constructor (#72)

## [9.0.0] - 2024-01-19

### Changed

-   Addition, subtraction, multiplication, division, and remainder are now static methods. This is a breaking change.

## [8.0.0] - 2024-01-19

### Removed

-   `sqrt`
-   `pow`
-   `reciprocal`
-   `truncate`, `floor`, and `ceil` (use `round` instead)

## [7.1.0] - 2023-12-29

### Added

-   Rounding modes for all operations (#54)

## [7.0.1] - 2023-12-21

### Added

-   LICENSE file

### Fixed

-   Ensure that the NPM package is nice and lean (#57) by removing unnecessary files and dependencies

## [7.0.0] - 2023-12-21

### Added

-   `toExponentialString`: Output a sign (`+` or `-`) in the exponent part. This is a breaking change.
-   [Fused multiply-and-add](https://en.wikipedia.org/wiki/Multiply–accumulate_operation#Fused_multiply–add) (`multiplyAdd`)

## [6.2.0] - 2023-12-18

### Added

-   Square root operation

## [6.1.0] - 2023-12-11

### Changed

-   Internal change in the representation of not-a-number and +/- infinity. No user-visible changes.

## [6.0.0] - 2023-12-08

### Added

-   We now support non-normalized decimals, i.e. decimals with a non-zero integer part. This is a breaking change for some use cases. In this approach, trailing zeros are not removed; they are considered significant. For instance, `0.25` plus `0.75` is now `1.00`, not `1`.

## [5.3.0] - 2023-10-25

### Added

-   `round` now takes a number argument (default 0) to
    specify the index of the decimal digit after which
    rounding should take place (#45)

## [5.2.0] - 2023-10-25

### Added

-   `pow` for raising a decimal to a power (#43)
