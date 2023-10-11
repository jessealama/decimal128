import { Decimal128 } from "../src/decimal128.mjs";

describe("rounding", () => {
    describe("no arguments (round to integer)", () => {
        test("positive odd", () => {
            expect(new Decimal128("1.5").round().toString()).toStrictEqual("2");
        });
        test("positive even", () => {
            expect(new Decimal128("2.5").round().toString()).toStrictEqual("3");
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
                "-3"
            );
        });
        test("round down (positive)", () => {
            expect(new Decimal128("1.1").round().toString()).toStrictEqual("1");
        });
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
            expect(minusOnePointFive.round("ceil").toString()).toStrictEqual(
                "-1"
            );
        });
        test("0.4", () => {
            expect(zeroPointFour.round("ceil").toString()).toStrictEqual("1");
        });
        test("0.5", () => {
            expect(zeroPointFive.round("ceil").toString()).toStrictEqual("1");
        });
        test("0.6", () => {
            expect(zeroPointSix.round("ceil").toString()).toStrictEqual("1");
        });
        test("1.5", () => {
            expect(onePointFive.round("ceil").toString()).toStrictEqual("2");
        });
    });
    describe("floor", () => {
        test("-1.5", () => {
            expect(minusOnePointFive.round("floor").toString()).toStrictEqual(
                "-2"
            );
        });
        test("0.4", () => {
            expect(zeroPointFour.round("floor").toString()).toStrictEqual("0");
        });
        test("0.5", () => {
            expect(zeroPointFive.round("floor").toString()).toStrictEqual("0");
        });
        test("0.6", () => {
            expect(zeroPointSix.round("floor").toString()).toStrictEqual("0");
        });
        test("1.5", () => {
            expect(onePointFive.round("floor").toString()).toStrictEqual("1");
        });
    });
    describe("expand", () => {
        test("-1.5", () => {
            expect(minusOnePointFive.round("expand").toString()).toStrictEqual(
                "-2"
            );
        });
        test("0.4", () => {
            expect(zeroPointFour.round("expand").toString()).toStrictEqual("1");
        });
        test("0.5", () => {
            expect(zeroPointFive.round("expand").toString()).toStrictEqual("1");
        });
        test("0.6", () => {
            expect(zeroPointSix.round("expand").toString()).toStrictEqual("1");
        });
        test("1.5", () => {
            expect(onePointFive.round("expand").toString()).toStrictEqual("2");
        });
    });
    describe("trunc", () => {
        test("-1.5", () => {
            expect(minusOnePointFive.round("trunc").toString()).toStrictEqual(
                "-1"
            );
        });
        test("0.4", () => {
            expect(zeroPointFour.round("trunc").toString()).toStrictEqual("0");
        });
        test("0.5", () => {
            expect(zeroPointFive.round("trunc").toString()).toStrictEqual("0");
        });
        test("0.6", () => {
            expect(zeroPointSix.round("trunc").toString()).toStrictEqual("0");
        });
        test("1.5", () => {
            expect(onePointFive.round("trunc").toString()).toStrictEqual("1");
        });
    });
    describe("halfCeil", () => {
        test("-1.5", () => {
            expect(
                minusOnePointFive.round("halfCeil").toString()
            ).toStrictEqual("-1");
        });
        test("0.4", () => {
            expect(zeroPointFour.round("halfCeil").toString()).toStrictEqual(
                "0"
            );
        });
        test("0.5", () => {
            expect(zeroPointFive.round("halfCeil").toString()).toStrictEqual(
                "1"
            );
        });
        test("0.6", () => {
            expect(zeroPointSix.round("halfCeil").toString()).toStrictEqual(
                "1"
            );
        });
        test("1.5", () => {
            expect(onePointFive.round("halfCeil").toString()).toStrictEqual(
                "2"
            );
        });
    });
    describe("halfFloor", () => {
        test("-1.5", () => {
            expect(
                minusOnePointFive.round("halfFloor").toString()
            ).toStrictEqual("-2");
        });
        test("0.4", () => {
            expect(zeroPointFour.round("halfFloor").toString()).toStrictEqual(
                "0"
            );
        });
        test("0.5", () => {
            expect(zeroPointFive.round("halfFloor").toString()).toStrictEqual(
                "0"
            );
        });
        test("0.6", () => {
            expect(zeroPointSix.round("halfFloor").toString()).toStrictEqual(
                "1"
            );
        });
        test("1.5", () => {
            expect(onePointFive.round("halfFloor").toString()).toStrictEqual(
                "1"
            );
        });
    });
    describe("halfExpand", () => {
        let opts = { "rounding-mode": "halfExpand" };
        test("-1.5", () => {
            expect(
                minusOnePointFive.round("halfExpand").toString()
            ).toStrictEqual("-2");
        });
        test("0.4", () => {
            expect(zeroPointFour.round("halfExpand").toString()).toStrictEqual(
                "0"
            );
        });
        test("0.5", () => {
            expect(zeroPointFive.round("halfExpand").toString()).toStrictEqual(
                "1"
            );
        });
        test("0.6", () => {
            expect(zeroPointSix.round("halfExpand").toString()).toStrictEqual(
                "1"
            );
        });
        test("1.5", () => {
            expect(onePointFive.round("halfExpand").toString()).toStrictEqual(
                "2"
            );
        });
    });
    describe("halfTrunc", () => {
        test("-1.5", () => {
            expect(
                minusOnePointFive.round("halfTrunc").toString()
            ).toStrictEqual("-1");
        });
        test("0.4", () => {
            expect(zeroPointFour.round("halfTrunc").toString()).toStrictEqual(
                "0"
            );
        });
        test("0.5", () => {
            expect(zeroPointFive.round("halfTrunc").toString()).toStrictEqual(
                "0"
            );
        });
        test("0.6", () => {
            expect(zeroPointSix.round("halfTrunc").toString()).toStrictEqual(
                "1"
            );
        });
        test("1.5", () => {
            expect(onePointFive.round("halfTrunc").toString()).toStrictEqual(
                "1"
            );
        });
    });
    describe("halfEven", () => {
        test("-1.5", () => {
            expect(
                minusOnePointFive.round("halfEven").toString()
            ).toStrictEqual("-2");
        });
        test("0.4", () => {
            expect(zeroPointFour.round("halfEven").toString()).toStrictEqual(
                "0"
            );
        });
        test("0.5", () => {
            expect(zeroPointFive.round("halfEven").toString()).toStrictEqual(
                "0"
            );
        });
        test("0.6", () => {
            expect(zeroPointSix.round("halfEven").toString()).toStrictEqual(
                "1"
            );
        });
        test("1.5", () => {
            expect(onePointFive.round("halfEven").toString()).toStrictEqual(
                "2"
            );
        });
    });
    test("NaN", () => {
        expect(new Decimal128("NaN").round().toString()).toStrictEqual("NaN");
    });
});
