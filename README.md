# decimal128.js—A userland approximation to IEEE 754 Decimal128 in JavaScript

This library is a prototype for the [decimal proposal](https://github.com/tc39/proposal-decimal). There should be no observable difference between what this library does and what the proposal is [supposed to do](http://tc39.es/proposal-decimal/). If you find a mismatch, please file [an issue](https://github.com/jessealama/decimal128/issues) in this repo.

## Operations

-   absolute value (`abs`)
-   addition (`add`)
-   subtraction (`subtract`)
-   multiplication (`multiply`)
-   division (`divide`)
-   remainder (`remainder`)
-   rounding (`round`)
-   `toString` emitting both decimal and exponential syntax (default is decimal)
-   less-than (`lessThan`) and equals (`equals`) to compare by mathematical value
-   `compare` for comparing Decimals as digit strings (e.g. `1.2` < `1.20`)

## Comparisons

-   equality (`equals`)
-   less than (`lessThan`)

## Implementation

This package is written in TypeScript. Unit tests are in Jest. There are no other external dependencies.

## Data model

This package aims to reproduce the IEEE 754 [Decimal128](https://en.wikipedia.org/wiki/Decimal128_floating-point_format) 128-bit decimal floating-point numbers in JavaScript. See the [decimal proposal](https://github.com/tc39/proposal-decimal/). These **decimal** (not binary!) numbers take up 128 bits per number. This format allows for an exact representation of decimal numbers with 34 (decimal) significant digits and an exponent between -6143 and 6144. That's a _vast_ amount of range and precision!
