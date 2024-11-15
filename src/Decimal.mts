import { Rational } from "./Rational.mjs";

function _cohort(s: string): "0" | "-0" | Rational {
    if (s.match(/^-/)) {
        let c = _cohort(s.substring(1));

        if (c === "0") {
            return "-0";
        }

        return (c as Rational).negate();
    }

    if (s.match(/^00+/)) {
        return _cohort(s.substring(1));
    }

    if (s.match(/^0([.]0+)?$/)) {
        return "0";
    }

    if (s.match(/^0[eE][+-]?[0-9]+$/)) {
        return "0";
    }

    return Rational.fromString(s);
}

function _quantum(s: string): number {
    if (s.match(/^-/)) {
        return _quantum(s.substring(1));
    }

    if (s.match(/[.]/)) {
        let [_, rhs] = s.split(".");

        if (rhs.match(/[eE]/)) {
            let [dec, exp] = rhs.split(/[eE]/);
            return parseInt(exp) - dec.length;
        }

        return 0 - rhs.length;
    }

    if (s.match(/[eE]/)) {
        let [_, exp] = s.split(/[eE]/);
        return parseInt(exp);
    }

    return 0;
}

interface CohortAndQuantum {
    cohort: "0" | "-0" | Rational;
    quantum: number;
}

export class Decimal {
    public readonly cohort: "0" | "-0" | Rational;
    public readonly quantum: number;

    constructor(x: string | CohortAndQuantum) {
        let v = typeof x === "string" ? _cohort(x) : x.cohort;
        let q = typeof x === "string" ? _quantum(x) : x.quantum;

        if (v instanceof Rational && v.isZero()) {
            throw new RangeError("A rational number cohort must not be zero.");
        }

        if (!Number.isInteger(q)) {
            throw new RangeError("The quantum must be an integer.");
        }

        if (Object.is(q, -0)) {
            throw new RangeError("The quantum cannot be negative zero.");
        }

        this.cohort = v;
        this.quantum = q;
    }

    public negate(): Decimal {
        let v = this.cohort as Rational;

        return new Decimal({
            cohort: v.negate(),
            quantum: this.quantum,
        });
    }

    public coefficient(): bigint {
        let v = this.cohort as Rational;
        let q = this.quantum;
        let c = v.scale10(0 - q);
        return c.numerator;
    }

    isNegative(): boolean {
        let v = this.cohort as Rational;
        return v.isNegative;
    }
}
