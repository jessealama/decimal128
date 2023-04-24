# decimal128.js—A userland approximation to IEEE 754 Decimal128 in JavaScript

## Operations

-   addition (`add`)
-   subtraction (`subtract`)
-   multiplication (`multiply`)
-   division (`divide`)
-   truncate (`trunctate`)
-   floor (`floor`)
-   ceiling (`ceiling`)
-   absolute value (`abs`)
-   `toString`
-   `toDecimalDigits`

## Implementation

This package is built on top of the excellent [`bignumber.js` package](https://mikemcl.github.io/bignumber.js/) for arbitrary-precision arithmetic. It is written in TypeScript. Unit tests are in Jest.

## Data model

This package aims to reproduce the IEEE 754 [Decimal128](https://en.wikipedia.org/wiki/Decimal128_floating-point_format) decimal floating-point numbers in JavaScript. These **decimal** (not binary!) numbers take up 128 bits of information per number. This format allows for an exact representation of decimal numbers with 34 (decimal) significant digits and an exponent between -6143 and 6144. That's a _vast_ amount of range and precision! Decimal128 is a fantastic standard. Let's implement it in JavaScript.

### Differences with the official Decimal128

This package is not literally an implementation of Decimal128. In time, it may _become_ one, but initially, this package is working with a subspace of Decimal128 that makes sense for the use cases we have in mind (mainly, finance).

#### Lack of support for specifying context

Decimal128 allows one to specify, globally, some configuration values (such as precision) that control all mathematical operations on Decimal128 values.

Think of this package as providing, basically, arbitrary-precision decimal numbers limited to those that fit into 128 bits the way that Decimal128 does it. No need to specify context. Just imagine that you're working in an ideal arbitrary-precision world, do the operation, and enjoy the results. (Of course, this can't _always_ work. But this suggestion is being offered to help you clear you mind of any "arithmetic context" cobwebs, if you have any.)

#### Values always normalized

Decimal128 works with **unnormalized** values. In the Decimal128 world, `1.2` and `1.20` are _distinct_ values. There's good reason for adopting such an approach, and some benefits. But this package deliberately works in a world of _normalized_ values. Given the string `1.20`, this package will turn that into `1.2`; that extra trailing zero will be lost. To recover the string `1.20`, additional, out-of-band information needs to be supplied. For instance: if you're working with numbers as financial quantities, you know, out-of-band, how to interpret your numbers. Thus, if I tell you that the cost of something is `1.2` USD, you know that means, and you know that, if you need to present that data to someone, you'd add an extra digit there. This package provides a `toDecimalDigits` method that allows you to generate `1.20` from the underlying `1.2`.

#### Missing operations

This package focuses on the bread and butter of arithmetic: addition, multiplication, subtraction, and division. To round things out from there (ha!), we have the absolute value function, trunction, floor/ceiling, and, of course, rounding.

## In-scope but not yet implemented

-   Exponential notation (e.g., `1.234E99`)
-   Options for operations, such as cutting off calculation after a certain number of digits

## Potentially in-scope, but currently unimplemented

-   A variant for unnormalized Decimal128 values. Decimal128 values are, out-of-the-box, not normalized.
