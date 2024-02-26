import axios from "axios";

const MARKET_API_URL = "DAOPI17U24R9RJR5"; // Replace with the actual API endpoint

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
  const sortedData = data.sort((a, b) =>
    isLoser ? a.performance - b.performance : b.performance - a.performance
  );
  return sortedData.slice(0, count);
}

// Default export for the marketController module
export default async function getTopLosersAndWinners() {
  try {
    const marketData = await getMarketData();

    // Assuming marketData has a "performance" property for each stock.
    const topLosers = calculateTopPerformers(marketData, 5, true);
    const topWinners = calculateTopPerformers(marketData, 5, false);

    return { topLosers, topWinners };
  } catch (error) {
    console.error("Error getting top losers and winners:", error);
    throw error;
  }
}
