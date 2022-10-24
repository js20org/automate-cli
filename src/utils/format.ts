export const getFormattedNumberFromFraction = (fraction: number) => {
    return (Math.round(fraction * 100) / 100)
        .toFixed(2)
        .replace('.00', '')
        .replace(/\.([0-9])0$/, '.$1');
};
