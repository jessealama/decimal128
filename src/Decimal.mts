import { Rational } from "./rational.mjs";

const ratOne = new Rational(1n, 1n);
const ratTen = new Rational(10n, 1n);

function _cohort(s: string): "0" | "-0" | Rational {
    if (s.match(/^-/)) {
        let c = _cohort(s.substring(1));

        if (c === "0") {
            return "-0";
        }

        if (c === "-0") {
            return "0";
        }

        return c.negate();
    }

    if (s.match(/^00+/)) {
        return _cohort(s.substring(1));
    }

    if (s.match(/^0([.]0+)?$/)) {
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
        let [dec, exp] = s.split(/[eE]/);
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
            throw new Error("The quantum must be an integer.");
        }

        if (v instanceof Rational) {
            let scaledV = v.scale10(0 - q);

            if (!scaledV.isInteger()) {
                throw new RangeError(
                    `Scaled value is not an integer (v = ${v}, q = ${q})`
                );
            }
        }

        this.cohort = v;
        this.quantum = q;
    }

    public isZero(): boolean {
        let v = this.cohort;
        return v === "0" || v === "-0";
    }

    public isInteger(): boolean {
        let v = this.cohort;

        if (v === "0" || v === "-0") {
            return true;
        }

        return v.isInteger();
    }

    public isNegative(): boolean {
        let v = this.cohort;

        if (v === "0") {
            return false;
        }

        if (v === "-0") {
            return true;
        }

        return v.isNegative;
    }

    public scale10(n: number, adjustQuantum?: boolean): Decimal {
        if (!Number.isInteger(n)) {
            throw new Error("The scale factor must be an integer.");
        }

        if (0 === n) {
            return this;
        }

        let v = this.cohort;
        let newQuantum = this.quantum;

        if (typeof adjustQuantum === "boolean" && adjustQuantum) {
            if (n < 0) {
                newQuantum -= n;
            } else {
                newQuantum += n;
            }
        }

        if (v === "0" || v === "-0") {
            return new Decimal({ cohort: v, quantum: newQuantum });
        }

        return new Decimal({
            cohort: v.scale10(n),
            quantum: newQuantum,
        });
    }

    public negate(): Decimal {
        let v = this.cohort;

        if (v === "0") {
            return new Decimal({ cohort: "-0", quantum: this.quantum });
        }

        if (v === "-0") {
            return new Decimal({ cohort: "0", quantum: this.quantum });
        }

        return new Decimal({
            cohort: v.negate(),
            quantum: this.quantum,
        });
    }

    public significand(): Rational {
        if (this.isNegative()) {
            return this.negate().significand();
        }

        let v = this.cohort;

        if (v === "0" || v === "-0") {
            throw new RangeError("Cannot compute coefficient of zero.");
        }

        while (ratTen.lessThan(v) || ratTen.equals(v)) {
            v = v.scale10(-1);
        }

        while (v.lessThan(ratOne)) {
            v = v.scale10(1);
        }

        return v;
    }

    public exponent(): number {
        if (this.isNegative()) {
            return this.negate().exponent();
        }

        let v = this.cohort;

        if (v === "0" || v === "-0") {
            throw new RangeError("Cannot compute coefficient of zero.");
        }

        let e = 0;

        while (ratTen.lessThan(v) || ratTen.equals(v)) {
            v = v.scale10(-1);
            e++;
        }

        while (v.lessThan(ratOne)) {
            v = v.scale10(1);
            e--;
        }

        return e;
    }
}
