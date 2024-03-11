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

// // export const getTopLosersAndWinners = async (count = 5) => {
// //   let allPerformances = [];

// //   for (const symbol of NASDAQ_100_SYMBOLS) {
// //     const records = readCSV(symbol);
// //     // Remember to transform your record into a proper format if needed

// //     allPerformances.push(
// //       ...records.map((record) => ({
// //         symbol: symbol,
// //         open: parseFloat(record["1. open"]),
// //         close: parseFloat(record["4. close"]),
// //         percentageChange: (
// //           ((parseFloat(record["4. close"]) - parseFloat(record["1. open"])) /
// //             parseFloat(record["1. open"])) *
// //           100
// //         ).toFixed(2),
// //       }))
// //     );
// //   }

// //   // Sort allPerformances by percentageChange, then get the top and bottom 'count' performers
// //   allPerformances.sort((a, b) => b.percentageChange - a.percentageChange);

// //   const topWinners = allPerformances.slice(0, count);
// //   const topLosers = allPerformances.slice(-count).reverse();

// //   return { topWinners, topLosers };
// // };

// // A function to process the CSV data for a single symbol and return the percentage change
// function processStockData(symbol) {
//   const records = readCSV(symbol);
//   if (records.length === 0) {
//     return null;
//   }

//   // Assuming the records are already sorted by time, which is typical for time series data
//   const earliestRecord = records[0];
//   const latestRecord = records[records.length - 1];

//   const openingPrice = parseFloat(earliestRecord.OPEN);
//   const closingPrice = parseFloat(latestRecord.CLOSE);

//   if (!isNaN(openingPrice) && !isNaN(closingPrice) && openingPrice !== 0) {
//     const percentageChange =
//       ((closingPrice - openingPrice) / openingPrice) * 100;
//     return {
//       symbol: symbol,
//       open: Number(openingPrice.toFixed(2)),
//       close: Number(closingPrice.toFixed(2)),
//       percentageChange: Number(percentageChange.toFixed(2)),
//     };
//   } else {
//     // Handle invalid data, such as missing opening or closing prices
//     console.warn(`Invalid data for symbol ${symbol}, skipping...`);
//     return null;
//   }
// }

// // A function to collate and compute the top winners and losers across all symbols
// function calculatePerformers(symbols) {
//   console.log("Processing stock data:", symbols);
//   const stockChanges = symbols.map(processStockData).filter(Boolean); // Remove null values

//   // Sort by descending order of percentage change to get top winners
//   const topWinners = [...stockChanges]
//     .sort((a, b) => b.percentageChange - a.percentageChange)
//     .slice(0, 5);

//   // Sort by ascending order of percentage change to get top losers
//   const topLosers = [...stockChanges]
//     .sort((a, b) => a.percentageChange - b.percentageChange)
//     .slice(0, 5);

//   return { topWinners, topLosers };
// }

// export const getTopLosersAndWinners = async () => {
//   const stockChanges = NASDAQ_100_SYMBOLS.map((symbol) => {
//     const records = readCSV(symbol);
//     return records.length ? processStockData(records) : null;
//   }).filter(Boolean); // Filter out any null values from failed processing attempts

//   // Now, sort the stockChanges array to find the top winners and losers
//   const sortedData = stockChanges.sort(
//     (a, b) => b.percentageChange - a.percentageChange
//   );

//   const topWinners = sortedData.slice(0, 5);
//   const topLosers = sortedData.slice(-sortedData.length).reverse().slice(0, 5);

//   return { topWinners, topLosers };
// };

const getTopLosersAndWinners = async () => {
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

const processStockData = (symbol, data) => {
  // Assumes the ARRAY is sorted (earliest to latest)
  const earliestRecord = data[0];
  const latestRecord = data[data.length - 1];

  const openingPrice = parseFloat(earliestRecord.OPEN);
  const closingPrice = parseFloat(latestRecord.CLOSE);
  const percentageChange = ((closingPrice - openingPrice) / openingPrice) * 100;

  return {
    symbol,
    openingPrice,
    closingPrice,
    percentageChange: percentageChange.toFixed(2),
  };
};

// const readCSV = (symbol) => {
//   try {
//     const filePath = path.join(PATH_TO_CSV_FILES, `${symbol}.csv`);
//     const csvString = fs.readFileSync(filePath, { encoding: 'utf-8' });
//     return parse(csvString, { columns: true, skip_empty_lines: true });
//   } catch (error) {
//     console.error(`Error reading CSV for ${symbol}:`, error.message);
//     return null; // Return null if there's an error
//   }
// };

// Export the function to be used by server.js
export { getTopLosersAndWinners };
