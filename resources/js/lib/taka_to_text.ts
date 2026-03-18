const units = [
    '',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
];
const teens = [
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
];
const tens = [
    '',
    '',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
];
const scales = ['', 'thousand', 'lakh', 'crore'];

function numberToWords(n: number): string {
    if (n === 0) return 'zero';

    let words: string[] = [];

    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    const hundred = Math.floor(n / 100);
    n %= 100;
    const ten = Math.floor(n / 10);
    const unit = n % 10;

    if (crore) words.push(`${numberToWords(crore)} crore`);
    if (lakh) words.push(`${numberToWords(lakh)} lakh`);
    if (thousand) words.push(`${numberToWords(thousand)} thousand`);
    if (hundred) words.push(`${numberToWords(hundred)} hundred`);

    if (n > 0) {
        if (words.length > 0) words.push('and');

        if (ten > 1) {
            words.push(tens[ten] + (unit ? `-${units[unit]}` : ''));
        } else if (ten === 1) {
            words.push(teens[unit]);
        } else if (unit > 0) {
            words.push(units[unit]);
        }
    }

    return words.join(' ');
}

export function takaToText(amount: number): string {
    const taka = Math.floor(amount);
    const poisha = Math.round((amount - taka) * 100);

    let result = '';

    if (taka > 0) result += `${numberToWords(taka)} taka`;
    if (poisha > 0) {
        if (result) result += ' and ';
        result += `${numberToWords(poisha)} poisha`;
    }

    if (!result) result = 'zero taka';

    return result;
}
