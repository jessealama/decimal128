import { Decimal128 } from "../src/decimal128.mjs";

function getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
}

function getRandomDigits(n: number): number[]
{
    let digits = [];
    for (let i = 0; i < n; i++) {
        digits.push(getRandomInt(10));
    }
    return digits;
}

function getRandomDigitsAsString(n: number): string
{
    let digits = getRandomDigits(n + 2);
    let result = digits.slice(0, n).join("") + "." + digits.slice(n).join("");
    let noInitialZeroes = result.replace(/^0+/, "");
    let noTrailingZeroes = noInitialZeroes.replace(/0+$/, "");
    return noTrailingZeroes.replace(/\.$/, "");
}

function compareNumbers(digits1: string): string {
    return Number(digits1).toString();
}

function keepTrying(): boolean {
    let digits1 = getRandomDigitsAsString(9);
    let result1 = compareNumbers(digits1);

    if (digits1 !== result1) {
        console.log(`${digits1} != ${result1}`);
    }

    return digits1 !== result1;
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
