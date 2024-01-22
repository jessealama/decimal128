import { Decimal128 } from "../src/decimal128.mjs";

const zero = new Decimal128("0");
const one = new Decimal128("1");

function calculateBill(items, tax) {
    let taxRate = Decimal128.add(new Decimal128(tax), one);
    let total = items.reduce((total, { price, count }) => {
        return Decimal128.multiply(
            Decimal128.add(total, new Decimal128(price)),
            new Decimal128(count)
        );
    }, zero);
    return Decimal128.multiply(total, taxRate);
}

const items = [
    { price: "1.25", count: "5" },
    { price: "5.00", count: "1" },
];
const tax = "0.0735";
console.log(calculateBill(items, tax).toString());
