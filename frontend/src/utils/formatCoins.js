export function formatCoins(amount) {
    // Ensure we are working with a number.
    const num = parseFloat(amount);
    // Format with two decimals.
    const fixed = num.toFixed(2);
    // If the decimals are exactly .00, drop them.
    if (fixed.endsWith('.00')) {
        return num.toFixed(0);
    }
    return fixed;
}
