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

const calculateTopPerformers = (priceData, count) => {
  // ... function logic as previously defined
  // You need to implement this based on how you want to structure your price data
};

export const getTopLosersAndWinners = async (count = 5) => {
  let allPerformances = [];

  for (const symbol of NASDAQ_100_SYMBOLS) {
    const records = readCSV(symbol);
    // Remember to transform your record into a proper format if needed

    allPerformances.push(
      ...records.map((record) => ({
        symbol: symbol,
        open: parseFloat(record["1. open"]),
        close: parseFloat(record["4. close"]),
        percentageChange: (
          ((parseFloat(record["4. close"]) - parseFloat(record["1. open"])) /
            parseFloat(record["1. open"])) *
          100
        ).toFixed(2),
      }))
    );
  }

  // Sort allPerformances by percentageChange, then get the top and bottom 'count' performers
  allPerformances.sort((a, b) => b.percentageChange - a.percentageChange);

  const topWinners = allPerformances.slice(0, count);
  const topLosers = allPerformances.slice(-count).reverse();

  return { topWinners, topLosers };
};
