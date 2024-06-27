/**
 * Counts the number of significant digits in a digit string, assumed to be normalized.
 *
 * @param s
 */
export function countSignificantDigits(s: string): number {
    if (s.match(/^-/)) {
        return countSignificantDigits(s.substring(1));
    }

    if (s.match(/^0[.]/)) {
        let m = s.match(/[.]0+/);

        if (m) {
            return s.length - m[0].length - 1;
        }

        return s.length - 2;
    }

    if (s.match(/[.]/)) {
        return s.length - 1;
    }

    let m = s.match(/^0+$/);

    s = s.replace(/^0+$/, "");

    return s.length;
}

export function countFractionalDigits(s: string): number {
    let [, fractional] = s.split(".");

    if (undefined === fractional) {
        return 0;
    }

    return fractional.length;
}

export type Digit = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9; // -1 signals that we're moving from the integer part to the decimal part of a decimal number
export type DigitOrTen = Digit | 10;

export const ROUNDING_MODE_CEILING = "ceil";
export const ROUNDING_MODE_FLOOR = "floor";
export const ROUNDING_MODE_TRUNCATE = "trunc";
export const ROUNDING_MODE_HALF_EVEN = "halfEven";
export const ROUNDING_MODE_HALF_EXPAND = "halfExpand";

export type RoundingMode =
    | "ceil"
    | "floor"
    | "trunc"
    | "halfEven"
    | "halfExpand";

export const ROUNDING_MODES: RoundingMode[] = [
    ROUNDING_MODE_CEILING,
    ROUNDING_MODE_FLOOR,
    ROUNDING_MODE_TRUNCATE,
    ROUNDING_MODE_HALF_EVEN,
    ROUNDING_MODE_HALF_EXPAND,
];

function roundIt(
    isNegative: boolean,
    digitToRound: Digit,
    decidingDigit: Digit,
    roundingMode: RoundingMode
): DigitOrTen {
    switch (roundingMode) {
        case ROUNDING_MODE_CEILING:
            if (isNegative) {
                return digitToRound;
            }

            if (0 === decidingDigit) {
                return digitToRound;
            }

            return (digitToRound + 1) as DigitOrTen;
        case ROUNDING_MODE_FLOOR:
            if (0 === decidingDigit) {
                return digitToRound;
            }

            if (isNegative) {
                return (digitToRound + 1) as DigitOrTen;
            }

            return digitToRound;
        case ROUNDING_MODE_TRUNCATE:
            return digitToRound;
        case ROUNDING_MODE_HALF_EXPAND:
            if (decidingDigit >= 5) {
                return (digitToRound + 1) as DigitOrTen;
            }

            return digitToRound;
        default: // ROUNDING_MODE_HALF_EVEN:
            if (decidingDigit === 5) {
                if (digitToRound % 2 === 0) {
                    return digitToRound;
                }

                return (digitToRound + 1) as DigitOrTen;
            }

            if (decidingDigit > 5) {
                return (digitToRound + 1) as DigitOrTen;
            }

            return digitToRound;
    }
}
