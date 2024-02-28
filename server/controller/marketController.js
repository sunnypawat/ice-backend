// marketController.js
import axios from "axios";
import { promisify } from "util";

// Replace with your actual API key
const API_KEY = "DAOPI17U24R9RJR5";
const RATE_LIMIT_DELAY_MS = 12000; // Alpha Vantage free tier usually allows 5 API requests per minute
const delay = promisify(setTimeout);

const NASDAQ_100_SYMBOLS = [
  "MSFT",
  "AAPL",
  "NVDA",
  "AMZN",
  "META",
  // "AVGO",
  // "TSLA",
  // "COST",
  // "GOOGL",
  // "GOOG",
  // "AMD",
  // "NFLX",
  // "ADBE",
  // "PEP",
  // "CSCO",
  // "TMUS",
  // "INTU",
  // "INTC",
  // "QCOM",
  // "AMAT",
  // "CMCSA",
  // "AMGN",
  // "TXN",
  // "ISRG",
  // "HON",
  // "LRCX",
  // "BKNG",
  // "VRTX",
  // "SBUX",
  // "REGN",
  // "ADP",
  // "MDLZ",
  // "MU",
  // "PANW",
  // "ADI",
  // "KLAC",
  // "GILD",
  // "SNPS",
  // "PDD",
  // "ASML",
  // "CDNS",
  // "MELI",
  // "CSX",
  // "MAR",
  // "CRWD",
  // "ABNB",
  // "CTAS",
  // "WDAY",
  // "PYPL",
  // "NXPI",
  // "ORLY",
  // "MRVL",
  // "PCAR",
  // "ROP",
  // "MNST",
  // "LULU",
  // "ADSK",
  // "FTNT",
  // "CPRT",
  // "ROST",
  // "ODFL",
  // "IDXX",
  // "DXCM",
  // "MCHP",
  // "PAYX",
  // "DASH",
  // "KHC",
  // "CHTR",
  // "CEG",
  // "AEP",
  // "FAST",
  // "GEHC",
  // "KDP",
  // "CTSH",
  // "DDOG",
  // "AZN",
  // "EA",
  // "TTD",
  // "MRNA",
  // "ZS",
  // "EXC",
  // "VRSK",
  // "CSGP",
  // "ON",
  // "CDW",
  // "CCEP",
  // "BIIB",
  // "MDB",
  // "XEL",
  // "DLTR",
  // "TEAM",
  // "FANG",
  // "BKR",
  // "GFS",
  // "ANSS",
  // "SPLK",
  // "TTWO",
  // "ILMN",
  // "WBD",
  // "SIRI",
  // "WBA",
];

async function getMarketData(symbol) {
  const marketApiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${API_KEY}`;
  try {
    const response = await axios.get(marketApiUrl);
    return response.data;
  } catch (error) {
    console.error(`Error fetching market data for ${symbol}:`, error);
    throw error;
  }
}

async function calculateTopPerformers(count) {
  let allStockData = {};

  for (let symbol of NASDAQ_100_SYMBOLS) {
    try {
      const data = await getMarketData(symbol);
      allStockData[symbol] = data["Time Series (5min)"];

      // Respect the API rate limit: wait for RATE_LIMIT_DELAY_MS between requests
      await delay(RATE_LIMIT_DELAY_MS);
    } catch (error) {
      console.warn(
        `An error occurred while fetching data for ${symbol}:`,
        error
      );
      // Optional: Decide how to handle individual symbol errors
    }
  }

  // Now we process the 'allStockData' to find the top performers
  let performers = [];
  for (let [symbol, timeSeries] of Object.entries(allStockData)) {
    if (!timeSeries) continue; // If no data was fetched for a symbol, skip it

    for (let [timestamp, data] of Object.entries(timeSeries)) {
      const openPrice = parseFloat(data["1. open"]);
      const closePrice = parseFloat(data["4. close"]);
      const percentageChange = ((closePrice - openPrice) / openPrice) * 100;

      performers.push({
        symbol,
        timestamp,
        open: data["1. open"],
        close: data["4. close"],
        percentageChange: parseFloat(percentageChange.toFixed(2)),
      });
    }
  }

  performers.sort((a, b) => b.percentageChange - a.percentageChange);

  // Get top 'n' winners and losers
  const topWinners = performers.slice(0, count);
  const topLosers = performers.slice(-count).reverse();

  return { topWinners, topLosers };
}

export async function getTopLosersAndWinners() {
  try {
    const { topWinners, topLosers } = await calculateTopPerformers(5);
    return { topWinners, topLosers };
  } catch (error) {
    console.error("Error getting top losers and winners:", error);
    throw error;
  }
}

// Usage:
// (async () => {
//   const results = await getTopLosersAndWinners();
//   console.log(results);
// })();
