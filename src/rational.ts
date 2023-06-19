const zero = BigInt(0);

function gcd(a: bigint, b: bigint): bigint {
    while (b !== zero) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

export class Rational {
    readonly numerator: bigint;
    readonly denominator: bigint;
    readonly isNegative: boolean;

    constructor(p: bigint, q: bigint) {
        if (q === zero) {
            throw new RangeError(
                "Cannot construct rational whose denominator is zero"
            );
        }

        let num = p;
        let den = q;
        let neg = false;

        if (p < zero) {
            if (q < zero) {
                num = -p;
                den = -q;
            } else {
                num = -p;
                neg = true;
            }
        } else if (q < zero) {
            den = -q;
            neg = true;
        }

        let g = gcd(num, den);
        this.numerator = p / g;
        this.denominator = q / g;
        this.isNegative = neg;
    }

    public toString(): string {
        return `${this.isNegative ? "-" : ""}${this.numerator}/${
            this.denominator
        }`;
    }

    private static _add(x: Rational, y: Rational): Rational {
        return new Rational(
            x.numerator * y.denominator + y.numerator * x.denominator,
            x.denominator * y.denominator
        );
    }

    private static _subtract(x: Rational, y: Rational): Rational {
        return new Rational(
            x.numerator * y.denominator - y.numerator * x.denominator,
            x.denominator * y.denominator
        );
    }

    private static _multiply(x: Rational, y: Rational): Rational {
        return new Rational(
            x.numerator * y.numerator,
            x.denominator * y.denominator
        );
    }

    private static _divide(x: Rational, y: Rational): Rational {
        return new Rational(
            x.numerator * y.denominator,
            x.denominator * y.numerator
        );
    }

    public static add(x: Rational, ...theArgs: Rational[]): Rational {
        return theArgs.reduce((acc, cur) => Rational._add(acc, cur), x);
    }

    public static subtract(x: Rational, ...theArgs: Rational[]): Rational {
        return theArgs.reduce((acc, cur) => Rational._subtract(acc, cur), x);
    }

    public static multiply(x: Rational, ...theArgs: Rational[]): Rational {
        return theArgs.reduce((acc, cur) => Rational._multiply(acc, cur), x);
    }

    public static divide(x: Rational, ...theArgs: Rational[]): Rational {
        return theArgs.reduce((acc, cur) => Rational._divide(acc, cur), x);
    }

    public negate(): Rational {
        return new Rational(-this.numerator, this.denominator);
    }

    public toDecimalPlaces(n: number): string {
        if (!Number.isInteger(n)) {
            throw new TypeError(
                "Cannot round to non-integer number of decimal places"
            );
        }

        if (n < 0) {
            throw new RangeError(
                "Cannot round to negative number of decimal places"
            );
        }

        throw new Error("Not implemented");
    }
}
