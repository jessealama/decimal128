import { Decimal128 } from "../src/decimal128.mjs";
import { pow } from "./pow.mjs";

const one = new Decimal128("1");
const paymentsPerYear = new Decimal128("12");

function calculateMonthlyPayment(
    principal: Decimal128,
    annualInterestRate: Decimal128,
    years: Decimal128
): Decimal128 {
    const monthlyInterestRate = annualInterestRate.divide(paymentsPerYear);
    const paymentCount = paymentsPerYear.multiply(years);
    const onePlusInterestRate = monthlyInterestRate.add(one);
    const ratePower = pow(
        onePlusInterestRate,
        Number(paymentCount.toString({ numDecimalDigits: 0 }))
    );
    return principal
        .multiply(monthlyInterestRate)
        .multiply(ratePower)
        .divide(ratePower.subtract(one));
}

console.log(
    calculateMonthlyPayment(
        new Decimal128("5000000"),
        new Decimal128("0.05"),
        new Decimal128("30")
    ).toString({ numDecimalDigits: 2 })
);
