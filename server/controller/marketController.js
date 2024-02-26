// marketController.js
import axios from "axios";

const MARKET_API_URL =
  "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=DAOPI17U24R9RJR5"; // Replace with the actual API endpoint

async function getMarketData() {
  try {
    const response = await axios.get(MARKET_API_URL);
    return response.data; // Adjust based on the structure of the API response
  } catch (error) {
    console.error("Error fetching market data:", error);
    throw error;
  }
}

function calculateTopPerformers(data, count, isLoser = false) {
  const dataArray = Object.entries(data).map(([timestamp, values]) => ({
    timestamp,
    ...values,
  }));

  const sortedData = dataArray.sort((a, b) =>
    isLoser ? a["4. close"] - b["4. close"] : b["4. close"] - a["4. close"]
  );

  const topPerformers = sortedData.slice(0, count).map((item) => {
    const openingPrice = parseFloat(item["1. open"]);
    const closingPrice = parseFloat(item["4. close"]);

    const isValidPrices = !isNaN(openingPrice) && !isNaN(closingPrice);

    const percentageChange = isValidPrices
      ? ((closingPrice - openingPrice) / openingPrice) * 100
      : 0;

    return {
      symbol: item["2. symbol"],
      timestamp: item.timestamp,
      percentageChange: isNaN(percentageChange)
        ? "0.00"
        : percentageChange.toFixed(2),
    };
  });

  return topPerformers;
}

// Named export for getTopLosersAndWinners
export async function getTopLosersAndWinners() {
  try {
    const marketData = await getMarketData();

    // Log the marketData to inspect its structure
    //console.log("Market Data:", marketData);

    // Assuming marketData has an array of items, each with a "performance" property.
    const topLosers = calculateTopPerformers(marketData, 5, true);
    const topWinners = calculateTopPerformers(marketData, 5, false);

    return { topLosers, topWinners };
  } catch (error) {
    console.error("Error getting top losers and winners:", error);
    throw error;
  }
}
