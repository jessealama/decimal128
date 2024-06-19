import { Decimal128 } from "../src/decimal128.mjs";

function getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
}

function getRandomDigits(n: number): number[] {
    let digits = [];
    for (let i = 0; i < n; i++) {
        digits.push(getRandomInt(10));
    }
    return digits;
}

function getRandomDigitsAsString(n: number): string {
    let digits = getRandomDigits(n + 4);
    return digits.slice(0, n).join("") + "." + digits.slice(n).join("");
}

function compareNumbers(
    digits1: string,
    digits2: string,
    digits3: string,
    digits4: string,
    digits5: string
): [string, string] {
    let d1 = new Decimal128(digits1);
    let d2 = new Decimal128(digits2);
    let d3 = new Decimal128(digits3);
    let d4 = new Decimal128(digits4);
    let d5 = new Decimal128(digits5);

    let decimalResult = d1.add(d2).add(d3).add(d4).multiply(d5);
    let numberResult =
        (Number(digits1) +
            Number(digits2) +
            Number(digits3) +
            Number(digits4)) *
        Number(digits5);
    let numberResultString = numberResult.toFixed(4);
    let decimalResultString = decimalResult.toFixed(4);

    return [numberResultString, decimalResultString];
}

function keepTrying(): boolean {
    let digits1 = getRandomDigitsAsString(3);
    let digits2 = getRandomDigitsAsString(3);
    let digits3 = getRandomDigitsAsString(4);
    let digits4 = getRandomDigitsAsString(4);
    let digits5 = getRandomDigitsAsString(4);

    let [result1, result2] = compareNumbers(
        digits1,
        digits2,
        digits3,
        digits4,
        digits5
    );

    if (result1 !== result2) {
        let diff = new Decimal128(result1)
            .subtract(new Decimal128(result2))
            .abs();
        console.log(
            `(${digits1} + ${digits2} + ${digits3} + ${digits4}) * ${digits5} = ${result1} but it should be ${result2} (difference: ${diff.toString()})`
        );
    }

    return result1 !== result2;
}

let numAttempts = 1000;
let numFailures = 0;
for (let i = 0; i < numAttempts; i++) {
    let failed = keepTrying();
    if (failed) {
        numFailures++;
    }
}

console.log(`Failed ${numFailures} out of ${numAttempts} attempts`);
