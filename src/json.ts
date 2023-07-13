import { Decimal128 } from "./decimal128.mjs";

const data = {
    "a": true,
    "b": "123.456"
};

const dataAsString = JSON.stringify(data);

const decimalRDigitsRegexp = /^[0-9]+[.][0-9]+$/;

function decimalify(key: string, value: any): any
{
    if (key.match(decimalRDigitsRegexp)) {
        return new Decimal128(key);
    } else {
        console.log(`key is not not a match: ${key}`);
    }

    return value;
}

console.log(JSON.parse(dataAsString, decimalify));
