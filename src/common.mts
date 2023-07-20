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

    let m = s.match(/0+$/);

    if (m) {
        return s.length - m[0].length;
    }

    return s.length;
}

export type Digit = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9; // -1 signals that we're moving from the integer part to the decimal part of a decimal number
