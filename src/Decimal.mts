import { Rational } from "./rational.mjs";

function _cohort(s: string): "0" | "-0" | Rational {
    if (s === "0" || s === "-0") {
        return s;
    }

    return Rational.fromString(s);
}

function _quantum(s: string): number {
    if (s.match(/^-/)) {
        return _quantum(s.substring(1));
    }

    if (!s.match(/[.]/)) {
        return 0;
    }

    let [_, rhs] = s.split(".");

    if (rhs.match(/[eE]/)) {
        let [dec, exp] = rhs.split(/[eE]/);
        return parseInt(exp) - dec.length;
    }

    return 0 - rhs.length;
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
}
