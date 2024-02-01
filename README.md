# decimal128.js—A userland approximation to IEEE 754 Decimal128 in JavaScript

This library is a prototype for the [decimal proposal](https://github.com/tc39/proposal-decimal). Apart from the intention of the decimal proposal for `valueOf` to unconditionally throw, there should be no observable difference between what this library does and what the proposal is [supposed to do](http://tc39.es/proposal-decimal/). If you find a mismatch, please file [an issue](https://github.com/jessealama/decimal128/issues) in this repo.

## Operations

-   addition (`add`)
-   subtraction (`subtract`)
-   multiplication (`multiply`)
-   division (`divide`)
-   remainder (`remainder`)
-   rounding (`round`)
-   `toString` emitting both decimal and exponential syntax (default is decimal)

## Implementation

This package is written in TypeScript. Unit tests are in Jest. There are no other external dependencies.

## Data model

This package aims to reproduce the IEEE 754 [Decimal128](https://en.wikipedia.org/wiki/Decimal128_floating-point_format) decimal floating-point numbers in JavaScript. These **decimal** (not binary!) numbers take up 128 bits of information per number. This format allows for an exact representation of decimal numbers with 34 (decimal) significant digits and an exponent between -6143 and 6144. That's a _vast_ amount of range and precision! Decimal128 is a fantastic standard. Let's implement it in JavaScript.

This package also supports minus zero, positive and negative infinity, and NaN. These values are distinct from JS's built-in `-0`, `Infinity`, `-Infinity`, and `NaN`, since those are all JS Numbers.

### Differences with the official Decimal128

This package is not literally an implementation of IEEE 754 Decimal128. This package defines a subset of Decimal128 that makes sense for the use cases we have in mind (mainly, though not exclusively, finance). Only a handful of arithmetic operations are implemented. We do not offer, for instance, the various trigonometric functions. Moreover, this package supports the concep of quiet NaNs only. Signalling NaNs are not supported here.

#### Lack of support for specifying context

IEEE 754 Decimal128 allows one to globally specify configuration values (e.g., precision) that control all mathematical operations on Decimal128 values. This JavaScript package does not support that. This package offers a purely functional subset of Decimal128; there's no ambient context to specify and set. If one wishes to control, e.g., rounding, then one needs to specify that when constructing Decimal128 values or doing arithmetic operations.

Think of this package as providing, basically, arbitrary-precision decimal numbers limited to those that fit into 128 bits the way that Decimal128 does it. No need to specify context. Just imagine that you're working in an ideal arbitrary-precision world, do the operation, and enjoy the results. If you need to cut off a calculation after a certain point, just perform the operation (e.g., addition) and use `round`.

#### Serialized values normalized by default

Decimal128 is a universe of **unnormalized** values. In the Decimal128 world, `1.2` and `1.20` are _distinct_ values. There's good reason for adopting such an approach, and has some benefits. But there can be surprises when working with non-normal values. This package supports IEEE 754 Decimal128, but it also aims to minimize surprises. In IEEE 754 Decimal128, if one adds, say, 1.2 and 3.8, the result is 5.0, not 5. (Again, those are _distinct_ values in IEEE 754 Decimal128.) Reproducing that example with this package, one has

```javascript
new Decimal128("1.2").add(new Decimal128("3.8")).toString(); // "5"
```

One can switch off normalization by setting the `normalize` option to `false` in `toString`, like this:

```javascript
new Decimal128("1.2").add(new Decimal128("3.8")).toString({ normalize: false }); // "5.0"
```
