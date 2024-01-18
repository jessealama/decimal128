# decimal128.js—A userland approximation to IEEE 754 Decimal128 in JavaScript

## Operations

-   addition (`add`)
-   subtraction (`subtract`)
-   multiplication (`multiply`)
-   division (`divide`)
-   remainder (`remainder`)
-   absolute value (`abs`)
-   `toString`
-   `toExponential`

## Implementation

This package is written in TypeScript. Unit tests are in (typed) Jest. There are no other external dependencies.

## Data model

This package aims to reproduce the IEEE 754 [Decimal128](https://en.wikipedia.org/wiki/Decimal128_floating-point_format) decimal floating-point numbers in JavaScript. These **decimal** (not binary!) numbers take up 128 bits of information per number. This format allows for an exact representation of decimal numbers with 34 (decimal) significant digits and an exponent between -6143 and 6144. That's a _vast_ amount of range and precision! Decimal128 is a fantastic standard. Let's implement it in JavaScript.

This package also supports minus zero, positive and negative infinity, and NaN.

This package aims to work with only _normalized_ values in the Decimal128 universe. With this package, there is no way to represent, say, `1.2` and `1.20` as distinct values. Digit strings are normalized right away, so `1.20` becomes `1.2`.

### Differences with the official Decimal128

This package is not literally an implementation of Decimal128. In time, it may _become_ one, but initially, this package is working with a subspace of Decimal128 that makes sense for the use cases we have in mind (mainly, finance).

#### Lack of support for specifying context

IEEE 754 Decimal128 allows one to globally specify configuration values (e.g., precision) that control all mathematical operations on Decimal128 values. This JavaScript package does not support that. Calculations are always done using all available digits.

Think of this package as providing, basically, arbitrary-precision decimal numbers limited to those that fit into 128 bits the way that Decimal128 does it. No need to specify context. Just imagine that you're working in an ideal arbitrary-precision world, do the operation, and enjoy the results. If you need to cut off a calculation after a certain point, just perform the operation (e.g., addition) and then use `toDecimalDigits` on the result.

#### Values always normalized

Decimal128 is a universe of **unnormalized** values. In the Decimal128 world, `1.2` and `1.20` are _distinct_ values. There's good reason for adopting such an approach, and some benefits. But this package deliberately works in a world of _normalized_ values. Given the string `1.20`, this package will turn that into `1.2`; that extra trailing zero will be lost. To recover the string `1.20`, additional, out-of-band information needs to be supplied. For instance: if you're working with numbers as financial quantities, you know, out-of-band, how to interpret your numbers. Thus, if I tell you that the cost of something is `1.2` USD, you know that means, and you know that, if you need to present that data to someone, you'd add an extra digit there. This package provides a `toDecimalDigits` method that allows you to generate `1.20` from the underlying `1.2`.

#### Missing operations

This package focuses on the bread and butter of arithmetic: addition, multiplication, subtraction, and division. To round things out from there (ha!), we have the absolute value function, trunction, floor/ceiling.
