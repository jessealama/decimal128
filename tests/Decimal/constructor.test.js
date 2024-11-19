import JSBI from "jsbi";
import { Decimal } from "../../src/Decimal.mjs";
import { Rational } from "../../src/Rational.mjs";

describe("Decimal constructor", () => {
    test("fails if given zero", () => {
        expect(
            () =>
                new Decimal({
                    cohort: new Rational(JSBI.BigInt(0), JSBI.BigInt(1)),
                    quantum: 0,
                })
        ).toThrow(RangeError);
    });
    test("fails if quantum is a non-integer", () => {
        expect(
            () =>
                new Decimal({
                    cohort: new Rational(JSBI.BigInt(1), JSBI.BigInt(1)),
                    quantum: 1.5,
                })
        ).toThrow(RangeError);
    });
    test("fails if quantum is minus zero", () => {
        expect(
            () =>
                new Decimal({
                    cohort: new Rational(JSBI.BigInt(1), JSBI.BigInt(1)),
                    quantum: -0,
                })
        ).toThrow(RangeError);
    });
});
