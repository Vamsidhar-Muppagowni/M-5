const generateSuggestedPrice = ({
    currentPrice,
    trendPercentage,
    volatility,
    confidence
}) => {
    if (!currentPrice || currentPrice <= 0) return 0;

    let suggestedPrice = currentPrice;

    // Apply trend base modifier
    if (trendPercentage > 1) {
        suggestedPrice = currentPrice * (1 + 0.02);
    } else if (trendPercentage < -1) {
        suggestedPrice = currentPrice * (1 - 0.015);
    } // else Stable: suggestedPrice = currentPrice

    // Adjust slightly based on volatility
    if (volatility === 'High Volatility') {
        // If high volatility, we reduce suggestion slightly to be safer (e.g. 1% lower)
        suggestedPrice = suggestedPrice * 0.99;
    }

    // Adjust based on confidence (optional, but requested to pass confidence)
    if (confidence < 70) {
        // If low confidence, we slightly lower the suggested price to ensure a quicker sale in uncertain conditions
        suggestedPrice = suggestedPrice * 0.995;
    }

    // Round to 2 decimal places
    return parseFloat(suggestedPrice.toFixed(2));
};

module.exports = {
    generateSuggestedPrice
};