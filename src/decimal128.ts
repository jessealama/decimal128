import BigNumber from "bignumber.js";

const scaleMin = -6143;
const scaleMax = 6144;
const maxSigDigits = 34;

function normalize(s: string): string {
    let minus = !!s.match(/^-/);
    let a = minus ? s.replace(/^-0+/, "-") : s.replace(/^0+/, "");
    let b = a.match(/[.]/) ? a.replace(/0+$/, "") : a;
    if (b.match(/^[.]/)) {
        b = "0" + b;
    }
    if (b.match(/[.]$/)) {
        b = b.substring(0, b.length - 1);
    }
    if ("-" === b || "" === b) {
        b = "0";
    }
    return b;
}

function significand(s: string): string {
    if (s.match(/^-/)) {
        return significand(s.substring(1));
    } else if (s.match(/^0[.]/)) {
        return significand(s.substring(2));
    } else if (s.match(/[.]/)) {
        return significand(s.replace(/[.]/, ""));
    } else if (s.match(/^0+/)) {
        return significand(s.replace(/^0+/, ""));
    } else if (s.match(/0+$/)) {
        return significand(s.replace(/0+$/, ""));
    } else {
        return s;
    }
}

function scale(s: string): number | undefined {
    if (s.match(/^-/)) {
        return scale(s.substring(1));
    } else if (s.match(/^0[.]/)) {
        return 0 - scale(s.substring(2));
    } else if (s.match(/[.]/)) {
        let [lhs] = s.split(".");
        return lhs.length;
    } else if ("0" === s) {
        return undefined;
    } else {
        return s.length;
    }
}

export class Decimal128 {
    public readonly significand: string;
    public readonly scale: number | undefined;
    public readonly isNegative: boolean;
    private readonly b: BigNumber;
    private readonly digitStrRegExp = /^-?[0-9]+([.][0-9]+)?$/;

    constructor(n: string) {
        if (!n.match(this.digitStrRegExp)) {
            throw new SyntaxError("Illegal number format");
        }

        this.isNegative = !!n.match(/^-/);

        let normalized = normalize(n);

        let sg = significand(normalized);
        let sc = scale(normalized);

        if (sg.length > maxSigDigits) {
            throw new RangeError(`Too many significant digits (${sg.length})`);
        }

        if (sc > scaleMax) {
            throw new RangeError(`Scale too big (${sc})`);
        }

        if (sc < scaleMin) {
            throw new RangeError(`Scale too small (${sc})`);
        }

        this.significand = sg;
        this.scale = sc;
        this.b = new BigNumber(normalized);
    }

    toString(): string {
        return normalize(this.b.toFixed());
    }

    isInteger(): boolean {
        return this.b.isInteger();
    }

    equals(x: Decimal128): boolean {
        return this.b.isEqualTo(x.b);
    }

    add(x: Decimal128): Decimal128 {
        return this.toDecimal128(this.b.plus(x.b));
    }

    subtract(x: Decimal128): Decimal128 {
        return this.toDecimal128(this.b.minus(x.b));
    }

    multiply(x: Decimal128): Decimal128 {
        return this.toDecimal128(this.b.multipliedBy(x.b));
    }

    divide(x: Decimal128): Decimal128 {
        if (x.b.isZero()) {
            throw new RangeError("Cannot divide by zero");
        }

        return this.toDecimal128(this.b.dividedBy(x.b));
    }

    abs(): Decimal128 {
        return this.toDecimal128(this.b.absoluteValue());
    }

    toDecimalPlaces(n: number): Decimal128 {
        if (!Number.isInteger(n)) {
            throw new TypeError("Argument must be an integer");
        }

        if (n <= 0) {
            throw new RangeError("Argument must be positive");
        }

        return new Decimal128(this.b.toFixed(n));
    }

    ceil(): Decimal128 {
        if (this.isInteger()) {
            return this;
        }

        return this.truncate().add(
            new Decimal128(this.isNegative ? "-1" : "1")
        );
    }

    floor(): Decimal128 {
        return this.truncate();
    }

    cmp(x: Decimal128): number {
        return this.b.comparedTo(x.b);
    }

    truncate(): Decimal128 {
        return new Decimal128(this.b.integerValue().toString());
    }

    private toDecimal128(x: BigNumber): Decimal128 {
        return new Decimal128(x.toFixed());
    }
}

export const E = new Decimal128("2.718281828459045235360287471352662");
