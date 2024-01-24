import { Decimal128 } from "../src/decimal128.mjs";
import { pow } from "./pow.js";

const one = new Decimal128("1");
const paymentsPerYear = new Decimal128("12");

function calculateMonthlyPayment(p, r, y) {
    let principal = new Decimal128(p);
    let annualInterestRate = new Decimal128(r);
    let years = new Decimal128(y);
    const monthlyInterestRate = annualInterestRate.divide(paymentsPerYear);
    const paymentCount = paymentsPerYear.multiply(years);
    const onePlusInterestRate = monthlyInterestRate.add(one);
    const ratePower = pow(onePlusInterestRate, paymentCount);

    let x = principal.multiply(monthlyInterestRate);
    let numerator = x.multiply(ratePower);

    let denominator = ratePower.subtract(one);

    return numerator.divide(denominator);
}

console.log(calculateMonthlyPayment("5000000", "0.05", "30").toString());
