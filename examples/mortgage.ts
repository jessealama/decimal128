import { Decimal128 } from "../src/decimal128.mjs";
import { pow } from "./pow.mjs";

const one = new Decimal128("1");
const paymentsPerYear = new Decimal128("12");

function calculateMonthlyPayment(p: string, r: string, y: string): Decimal128 {
    const principal = new Decimal128(p);
    const annualInterestRate = new Decimal128(r);
    const years = new Decimal128(y);
    const monthlyInterestRate = annualInterestRate.divide(paymentsPerYear);
    const paymentCount = paymentsPerYear.multiply(years);
    const onePlusInterestRate = monthlyInterestRate.add(one);
    const ratePower = pow(onePlusInterestRate, Number(paymentCount.toString()));

    const x = principal.multiply(monthlyInterestRate);

    return x.multiply(ratePower).divide(ratePower.subtract(one));
}

const amount = calculateMonthlyPayment("5000000", "0.05", "30");

console.log(amount.round(2).toString({ normalize: false }));
