"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var decimal_js_1 = require("./decimal.js");
var maxDigits = 34;
decimal_js_1.default.set({ precision: maxDigits });
function normalize(s) {
    var a = s.replace(/^[0]+/, "");
    var b = a.replace(/[0]+$/, "");
    if (b.match(/^[.]/)) {
        b = "0" + b;
    }
    if (b.match(/[.]$/)) {
        b = b.substring(0, b.length - 1);
    }
    return b;
}
var Decimal128 = /** @class */ (function () {
    function Decimal128(n) {
        if (n.length > maxDigits) {
            throw new RangeError(
                "Cannot construct Decimal128 value: string too long"
            );
        }
        if (n.match(/^[0-9]+([.][0-9]+)?$/)) {
            this.d = new decimal_js_1.default(normalize(n));
        } else {
            throw new RangeError("Illegal number format");
        }
    }
    Decimal128.prototype.decimalToDecimal128 = function (x) {
        return new Decimal128(x.toPrecision(maxDigits));
    };
    Decimal128.prototype.add = function (x) {
        return this.decimalToDecimal128(this.d.add(x.d));
    };
    return Decimal128;
})();
console.log(new Decimal128("123456789123456789123456789123456789"));
