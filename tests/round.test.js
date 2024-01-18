import { Decimal128 } from "../src/decimal128.mjs";
import * as string_decoder from "string_decoder";
import { expectDecimal128 } from "./util.js";

const roundingModes = [
    "ceil",
    "floor",
    "expand",
    "trunc",
    "halfEven",
    "halfExpand",
    "halfCeil",
    "halfFloor",
    "halfTrunc",
];

describe("rounding", () => {
    describe("no arguments (round to integer)", () => {
        test("positive odd", () => {
            expect(new Decimal128("1.5").round().toString()).toStrictEqual("2");
        });
        test("positive even", () => {
            expect(new Decimal128("2.5").round().toString()).toStrictEqual("2");
        });
        test("round up (positive)", () => {
            expect(new Decimal128("2.6").round().toString()).toStrictEqual("3");
        });
        test("negative odd", () => {
            expect(new Decimal128("-1.5").round().toString()).toStrictEqual(
                "-2"
            );
        });
        test("negative even", () => {
            expect(new Decimal128("-2.5").round().toString()).toStrictEqual(
                "-2"
            );
        });
        test("round down (positive)", () => {
            expect(new Decimal128("1.1").round().toString()).toStrictEqual("1");
        });
    });
    describe("round after a certain number of decimal digits", () => {
        test("multiple digits", () => {
            expect(new Decimal128("42.345").round(2).toString()).toStrictEqual(
                "42.34"
            );
        });
        test("more digits than are available", () => {
            expect(new Decimal128("1.5").round(1).toString()).toStrictEqual(
                "1.5"
            );
        });
        test("more digits than are available", () => {
            expect(new Decimal128("1.5").round(2).toString()).toStrictEqual(
                "1.50"
            );
        });
        test("negative odd", () => {
            expect(new Decimal128("-1.5").round(1).toString()).toStrictEqual(
                "-1.5"
            );
        });
        test("round down (positive)", () => {
            expect(new Decimal128("1.1").round(6).toString()).toStrictEqual(
                "1.100000"
            );
        });
    });
    test("integer", () => {
        expect(new Decimal128("42").round().toString()).toStrictEqual("42");
    });
    test("negative integer", () => {
        expect(new Decimal128("-42").round().toString()).toStrictEqual("-42");
    });
    test("negative number of digits requested", () => {
        expect(() => new Decimal128("1.5").round(-42)).toThrow(RangeError);
    });
    test("too many digits requested", () => {
        expect(() => new Decimal128("1.5").round(2 ** 53)).toThrow(RangeError);
    });
});

describe("Intl.NumberFormat examples", () => {
    let minusOnePointFive = new Decimal128("-1.5");
    let zeroPointFour = new Decimal128("0.4");
    let zeroPointFive = new Decimal128("0.5");
    let zeroPointSix = new Decimal128("0.6");
    let onePointFive = new Decimal128("1.5");
    describe("ceil", () => {
        test("-1.5", () => {
            expect(minusOnePointFive.round(0, "ceil").toString()).toStrictEqual(
                "-1"
            );
        });
        test("0.4", () => {
            expect(zeroPointFour.round(0, "ceil").toString()).toStrictEqual(
                "1"
            );
        });
        test("0.5", () => {
            expect(zeroPointFive.round(0, "ceil").toString()).toStrictEqual(
                "1"
            );
        });
        test("0.6", () => {
            expect(zeroPointSix.round(0, "ceil").toString()).toStrictEqual("1");
        });
        test("1.5", () => {
            expect(onePointFive.round(0, "ceil").toString()).toStrictEqual("2");
        });
    });
    describe("floor", () => {
        test("-1.5", () => {
            expect(
                minusOnePointFive.round(0, "floor").toString()
            ).toStrictEqual("-2");
        });
        test("0.4", () => {
            expect(zeroPointFour.round(0, "floor").toString()).toStrictEqual(
                "0"
            );
        });
        test("0.5", () => {
            expect(zeroPointFive.round(0, "floor").toString()).toStrictEqual(
                "0"
            );
        });
        test("0.6", () => {
            expect(zeroPointSix.round(0, "floor").toString()).toStrictEqual(
                "0"
            );
        });
        test("1.5", () => {
            expect(onePointFive.round(0, "floor").toString()).toStrictEqual(
                "1"
            );
        });
    });
    describe("expand", () => {
        test("-1.5", () => {
            expect(
                minusOnePointFive.round(0, "expand").toString()
            ).toStrictEqual("-2");
        });
        test("0.4", () => {
            expect(zeroPointFour.round(0, "expand").toString()).toStrictEqual(
                "1"
            );
        });
        test("0.5", () => {
            expect(zeroPointFive.round(0, "expand").toString()).toStrictEqual(
                "1"
            );
        });
        test("0.6", () => {
            expect(zeroPointSix.round(0, "expand").toString()).toStrictEqual(
                "1"
            );
        });
        test("1.5", () => {
            expect(onePointFive.round(0, "expand").toString()).toStrictEqual(
                "2"
            );
        });
    });
    describe("trunc", () => {
        test("-1.5", () => {
            expect(
                minusOnePointFive.round(0, "trunc").toString()
            ).toStrictEqual("-1");
        });
        test("0.4", () => {
            expect(zeroPointFour.round(0, "trunc").toString()).toStrictEqual(
                "0"
            );
        });
        test("0.5", () => {
            expect(zeroPointFive.round(0, "trunc").toString()).toStrictEqual(
                "0"
            );
        });
        test("0.6", () => {
            expect(zeroPointSix.round(0, "trunc").toString()).toStrictEqual(
                "0"
            );
        });
        test("1.5", () => {
            expect(onePointFive.round(0, "trunc").toString()).toStrictEqual(
                "1"
            );
        });
    });
    describe("halfCeil", () => {
        test("-1.5", () => {
            expect(
                minusOnePointFive.round(0, "halfCeil").toString()
            ).toStrictEqual("-1");
        });
        test("0.4", () => {
            expect(zeroPointFour.round(0, "halfCeil").toString()).toStrictEqual(
                "0"
            );
        });
        test("0.5", () => {
            expect(zeroPointFive.round(0, "halfCeil").toString()).toStrictEqual(
                "1"
            );
        });
        test("0.6", () => {
            expect(zeroPointSix.round(0, "halfCeil").toString()).toStrictEqual(
                "1"
            );
        });
        test("1.5", () => {
            expect(onePointFive.round(0, "halfCeil").toString()).toStrictEqual(
                "2"
            );
        });
    });
    describe("halfFloor", () => {
        test("-1.5", () => {
            expect(
                minusOnePointFive.round(0, "halfFloor").toString()
            ).toStrictEqual("-2");
        });
        test("0.4", () => {
            expect(
                zeroPointFour.round(0, "halfFloor").toString()
            ).toStrictEqual("0");
        });
        test("0.5", () => {
            expect(
                zeroPointFive.round(0, "halfFloor").toString()
            ).toStrictEqual("0");
        });
        test("0.6", () => {
            expect(zeroPointSix.round(0, "halfFloor").toString()).toStrictEqual(
                "1"
            );
        });
        test("1.5", () => {
            expect(onePointFive.round(0, "halfFloor").toString()).toStrictEqual(
                "1"
            );
        });
    });
    describe("halfExpand", () => {
        let opts = { "rounding-mode": "halfExpand" };
        test("-1.5", () => {
            expect(
                minusOnePointFive.round(0, "halfExpand").toString()
            ).toStrictEqual("-2");
        });
        test("0.4", () => {
            expect(
                zeroPointFour.round(0, "halfExpand").toString()
            ).toStrictEqual("0");
        });
        test("0.5", () => {
            expect(
                zeroPointFive.round(0, "halfExpand").toString()
            ).toStrictEqual("1");
        });
        test("0.6", () => {
            expect(
                zeroPointSix.round(0, "halfExpand").toString()
            ).toStrictEqual("1");
        });
        test("1.5", () => {
            expect(
                onePointFive.round(0, "halfExpand").toString()
            ).toStrictEqual("2");
        });
    });
    describe("halfTrunc", () => {
        test("-1.5", () => {
            expect(
                minusOnePointFive.round(0, "halfTrunc").toString()
            ).toStrictEqual("-1");
        });
        test("0.4", () => {
            expect(
                zeroPointFour.round(0, "halfTrunc").toString()
            ).toStrictEqual("0");
        });
        test("0.5", () => {
            expect(
                zeroPointFive.round(0, "halfTrunc").toString()
            ).toStrictEqual("0");
        });
        test("0.6", () => {
            expect(zeroPointSix.round(0, "halfTrunc").toString()).toStrictEqual(
                "1"
            );
        });
        test("1.5", () => {
            expect(onePointFive.round(0, "halfTrunc").toString()).toStrictEqual(
                "1"
            );
        });
    });
    describe("halfEven", () => {
        test("-1.5", () => {
            expect(
                minusOnePointFive.round(0, "halfEven").toString()
            ).toStrictEqual("-2");
        });
        test("0.4", () => {
            expect(zeroPointFour.round(0, "halfEven").toString()).toStrictEqual(
                "0"
            );
        });
        test("0.5", () => {
            expect(zeroPointFive.round(0, "halfEven").toString()).toStrictEqual(
                "0"
            );
        });
        test("0.6", () => {
            expect(zeroPointSix.round(0, "halfEven").toString()).toStrictEqual(
                "1"
            );
        });
        test("1.5", () => {
            expect(onePointFive.round(0, "halfEven").toString()).toStrictEqual(
                "2"
            );
        });
    });
    test("NaN", () => {
        expect(new Decimal128("NaN").round().toString()).toStrictEqual("NaN");
    });
    describe("infinity", () => {
        let posInf = new Decimal128("Infinity");
        let negInf = new Decimal128("-Infinity");
        test(`positive infinity (no argument)`, () => {
            expect(posInf.round().toString()).toStrictEqual("Infinity");
        });
        for (let roundingMode of roundingModes) {
            test(`positive infinity (${roundingMode})`, () => {
                expect(posInf.round(0, roundingMode).toString()).toStrictEqual(
                    "Infinity"
                );
            });
        }
        test(`negative infinity (no argument)`, () => {
            expect(negInf.round().toString()).toStrictEqual("-Infinity");
        });
        for (let roundingMode of roundingModes) {
            test(`negative infinity (${roundingMode})`, () => {
                expect(negInf.round(0, roundingMode).toString()).toStrictEqual(
                    "-Infinity"
                );
            });
        }
        test("rounding positive a certain number of digits makes no difference", () => {
            expect(posInf.round(2).toString()).toStrictEqual("Infinity");
        });
        test("rounding negative infinity a certain number of digits makes no difference", () => {
            expect(negInf.round(2).toString()).toStrictEqual("-Infinity");
        });
    });
});

describe("ceiling", function () {
    test("ceiling works (positive)", () => {
        expect(
            new Decimal128("123.456").round(0, "ceil").toString()
        ).toStrictEqual("124");
    });
    test("ceiling works (negative)", () => {
        expect(
            new Decimal128("-123.456").round(0, "ceil").toString()
        ).toStrictEqual("-123");
    });
    test("ceiling of an integer is unchanged", () => {
        expect(new Decimal128("123").round(0, "ceil").toString()).toStrictEqual(
            "123"
        );
    });
    test("NaN", () => {
        expect(new Decimal128("NaN").round(0, "ceil").toString()).toStrictEqual(
            "NaN"
        );
    });
    test("positive infinity", () => {
        expect(
            new Decimal128("Infinity").round(0, "ceil").toString()
        ).toStrictEqual("Infinity");
    });
    test("minus infinity", () => {
        expect(
            new Decimal128("-Infinity").round(0, "ceil").toString()
        ).toStrictEqual("-Infinity");
    });
});

describe("truncate", () => {
    describe("truncate", () => {
        let data = {
            123.45678: "123",
            "-42.99": "-42",
            0.00765: "0",
        };
        for (let [key, value] of Object.entries(data)) {
            test(key, () => {
                expectDecimal128(new Decimal128(key).round(0, "trunc"), value);
            });
        }
        test("NaN", () => {
            expect(
                new Decimal128("NaN").round(0, "trunc").toString()
            ).toStrictEqual("NaN");
        });
    });

    describe("infinity", () => {
        test("positive infinity", () => {
            expect(
                new Decimal128("Infinity").round(0, "trunc").toString()
            ).toStrictEqual("Infinity");
        });
        test("negative infinity", () => {
            expect(
                new Decimal128("-Infinity").round(0, "trunc").toString()
            ).toStrictEqual("-Infinity");
        });
    });
});

describe("floor", function () {
    test("floor works (positive)", () => {
        expect(
            new Decimal128("123.456").round(0, "floor").toString()
        ).toStrictEqual("123");
    });
    test("floor works (negative)", () => {
        expect(
            new Decimal128("-123.456").round(0, "floor").toString()
        ).toStrictEqual("-124");
    });
    test("floor of integer is unchanged", () => {
        expect(
            new Decimal128("123").round(0, "floor").toString()
        ).toStrictEqual("123");
    });
    test("floor of zero is unchanged", () => {
        expect(new Decimal128("0").round(0, "floor").toString()).toStrictEqual(
            "0"
        );
    });
    test("NaN", () => {
        expect(
            new Decimal128("NaN").round(0, "floor").toString()
        ).toStrictEqual("NaN");
    });
    test("positive infinity", () => {
        expect(
            new Decimal128("Infinity").round(0, "floor").toString()
        ).toStrictEqual("Infinity");
    });
    test("minus infinity", () => {
        expect(
            new Decimal128("-Infinity").round(0, "floor").toString()
        ).toStrictEqual("-Infinity");
    });
});
