import { Decimal128 } from "../dist/esm/decimal128.mjs";

const zero = new Decimal128("0");
const one = new Decimal128("1");

interface Item {
    price: string;
    count: string;
}

function calculateBill(items: Item[], tax: string): Decimal128 {
    let total = items.reduce((total, { price, count }) => {
        return total.add(new Decimal128(price).multiply(new Decimal128(count)));
    }, zero);
    return total.multiply(new Decimal128(tax).add(one));
}

const items = [
    { price: "1.25", count: "5" },
    { price: "5.00", count: "1" },
];
const tax = "0.0735";
console.log(calculateBill(items, tax).toString({ numDecimalDigits: 2 }));
