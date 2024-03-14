// marketController.js
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { fileURLToPath } from "url";
import { NASDAQ_100_SYMBOLS } from "./dataFetcher.js";

// Convert the URL of the current module ('marketController.js') to a file path
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve the path to the 'data' directory
const PATH_TO_CSV_FILES = path.join(__dirname, "data");

const readCSV = (symbol) => {
  try {
    const filePath = path.join(PATH_TO_CSV_FILES, `${symbol}.csv`);
    const data = fs.readFileSync(filePath);
    return parse(data, {
      columns: true,
      skip_empty_lines: true,
    });
  } catch (error) {
    console.error(`Error reading CSV for ${symbol}:`, error);
    throw new Error(`Cannot read CSV for symbol: ${symbol}`);
  }
};

export const getTopLosersAndWinners = async () => {
  let stockDataArray = [];

  // Process each symbol
  for (const symbol of NASDAQ_100_SYMBOLS) {
    const data = readCSV(symbol);

    if (data && data.length > 0) {
      const stockData = processStockData(symbol, data);
      if (stockData) {
        stockDataArray.push(stockData);
      }
    }
  }

  // Sort the data to find the top winners and losers
  stockDataArray.sort((a, b) => b.percentageChange - a.percentageChange);

  // Get top 5 winners and last 5 (top losers)
  const topWinners = stockDataArray.slice(0, 5);
  const topLosers = stockDataArray.slice(-5);

  return { topWinners, topLosers };
};

export const getTopVolumeStocks = (stockDataArray) => {
  // Sort by volume in descending order and slice the top 5
  const topVolumeStocks = stockDataArray
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  return topVolumeStocks;
};

export const getTopVolumeTraded = async () => {
  let stockDataArray = [];
  for (const symbol of NASDAQ_100_SYMBOLS) {
    const data = readCSV(symbol);
    if (data && data.length > 0) {
      stockDataArray.push(processStockData(symbol, data));
    }
  }
  return getTopVolumeStocks(stockDataArray);
};

const processStockData = (symbol, data) => {
  // Assumes the ARRAY is sorted (earliest to latest)
  const earliestRecord = data[0];
  const latestRecord = data[data.length - 1];

  const openingPrice = parseFloat(earliestRecord.OPEN);
  const closingPrice = parseFloat(latestRecord.CLOSE);
  const percentageChange = ((closingPrice - openingPrice) / openingPrice) * 100;
  const totalVolume = data.reduce(
    (acc, record) => acc + Number(record.VOLUME),
    0
  );

  return {
    symbol,
    openingPrice,
    closingPrice,
    percentageChange: percentageChange.toFixed(2),
    volume: totalVolume,
  };
};
