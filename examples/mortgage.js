import { Decimal128 } from "../src/decimal128.mjs";
import { pow } from "./pow.js";

const one = new Decimal128("1");
const paymentsPerYear = new Decimal128("12");

function calculateMonthlyPayment(p, r, y) {
    let principal = new Decimal128(p);
    let annualInterestRate = new Decimal128(r);
    let years = new Decimal128(y);
    const monthlyInterestRate = Decimal128.divide(
        annualInterestRate,
        paymentsPerYear
    );
    const paymentCount = Decimal128.multiply(paymentsPerYear, years);
    const onePlusInterestRate = Decimal128.add(one, monthlyInterestRate);
    const ratePower = pow(onePlusInterestRate, paymentCount);

    let x = Decimal128.multiply(principal, monthlyInterestRate);
    let numerator = Decimal128.multiply(x, ratePower);

    let denominator = Decimal128.subtract(ratePower, one);

    return Decimal128.divide(numerator, denominator);
}

console.log(calculateMonthlyPayment("5000000", "0.05", "30").toString());
