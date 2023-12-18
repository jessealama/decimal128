# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

-   Fused multiply-add

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
