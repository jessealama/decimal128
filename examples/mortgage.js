import { Decimal128 } from "../src/decimal128.mjs";
import { pow } from "./pow.js";

const one = new Decimal128("1");
const paymentsPerYear = new Decimal128("12");

function calculateMonthlyPayment(p, r, y) {
    const principal = new Decimal128(p);
    const annualInterestRate = new Decimal128(r);
    const years = new Decimal128(y);
    const monthlyInterestRate = annualInterestRate.divide(paymentsPerYear);
    const paymentCount = paymentsPerYear.multiply(years);
    const onePlusInterestRate = monthlyInterestRate.add(one);
    const ratePower = pow(onePlusInterestRate, paymentCount);

    const x = principal.multiply(monthlyInterestRate);

    return x.multiply(ratePower).divide(ratePower.subtract(one));
}

console.log(calculateMonthlyPayment("5000000", "0.05", "30").toString());
