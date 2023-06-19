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
            throw new RangeError("Cannot construct rational whose denominator is zero");
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

        let g = gcd(p, q);
        this.numerator = p / g;
        this.denominator = q / g;
        this.isNegative = neg;
    }
}
