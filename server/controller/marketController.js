// marketController.js
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { fileURLToPath } from "url";
import { NASDAQ_100_SYMBOLS } from "./dataFetcher.js"; // Ensure this path is correct

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

const getStockData = (symbol) => {
  try {
    const filePath = path.join(PATH_TO_CSV_FILES, `${symbol}.csv`);
    const csvString = fs.readFileSync(filePath, { encoding: "utf-8" });
    const records = parse(csvString, { columns: true, skip_empty_lines: true });

    if (!records || records.length === 0) {
      return null;
    }

    const latestRecord = records[records.length - 1];
    const totalVolume = records.reduce(
      (acc, record) => acc + Number(record.VOLUME),
      0
    );

    return {
      symbol,
      open: latestRecord.OPEN,
      high: latestRecord.HIGH,
      low: latestRecord.LOW,
      close: latestRecord.CLOSE,
      volume: totalVolume.toString(),
    };
  } catch (error) {
    console.error(`Error processing data for symbol ${symbol}:`, error);
    return null;
  }
};

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

const getTopVolumeStocks = (stockDataArray) => {
  // Sort by volume in descending order and slice the top 5
  const topVolumeStocks = stockDataArray
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  return topVolumeStocks;
};

const getTopVolumeTraded = async () => {
  let stockDataArray = [];
  for (const symbol of NASDAQ_100_SYMBOLS) {
    const data = readCSV(symbol);
    if (data && data.length > 0) {
      stockDataArray.push(processStockData(symbol, data));
    }
  }
  return getTopVolumeStocks(stockDataArray);
};

const getPreviousCloseTopFive = async () => {
  let stockDataArray = [];

  for (const symbol of NASDAQ_100_SYMBOLS) {
    const data = readCSV(symbol);

    if (data && data.length > 0) {
      // Assuming the first record in the array is the oldest
      const previousCloseData = {
        symbol: symbol,
        previousClose: parseFloat(data[0].CLOSE), // Assuming data is sorted with the oldest first
      };

      stockDataArray.push(previousCloseData);
    }
  }

  // Sort by previousClose in descending order and return the top 5
  return stockDataArray
    .sort((a, b) => b.previousClose - a.previousClose)
    .slice(0, 5);
};

const getOpeningTopFive = async () => {
  let stockDataArray = [];

  for (const symbol of NASDAQ_100_SYMBOLS) {
    const data = readCSV(symbol);

    if (data && data.length > 0) {
      // Assuming the first record in the array is the oldest
      const openingData = {
        symbol: symbol,
        opening: parseFloat(data[0].OPEN), // Assuming data is sorted with the oldest first
      };

      stockDataArray.push(openingData);
    }
  }

  // Sort by opening in descending order and return the top 5
  return stockDataArray.sort((a, b) => b.opening - a.opening).slice(0, 5);
};

const getAllStockData = async () => {
  const allStocksData = NASDAQ_100_SYMBOLS.map((symbol) =>
    getStockData(symbol)
  ).filter(Boolean);
  return allStocksData;
};

// Additional exportable functions (new endpoints)
const getMarketData = async (req, res) => {
  try {
    const allStockData = await getAllStockData();
    res.status(200).json(allStockData);
  } catch (error) {
    console.error(`Error fetching all stocks data`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getMarketMovers = async (req, res) => {
  try {
    const { topLosers, topWinners } = await getTopLosersAndWinners();
    res.status(200).json({ topWinners, topLosers });
  } catch (error) {
    console.error(`Error in /api/stocks/movers:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getStocksTopVolumeTraded = async (req, res) => {
  try {
    const topVolumeTraded = await getTopVolumeTraded();
    res.status(200).json({ topVolumeTraded });
  } catch (error) {
    console.error(`Error in /api/stocks/top-volume-traded`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getStocksKeyMetrics = async (req, res) => {
  try {
    const stockDataArray = await getAllStockData(); // Get the data for all stocks
    const topVolumeTraded = getTopVolumeStocks(stockDataArray);
    const previousCloseTopFive = await getPreviousCloseTopFive(stockDataArray);
    const openingTopFive = await getOpeningTopFive(stockDataArray);

    res.status(200).json({
      topVolumeTraded,
      previousCloseTopFive,
      openingTopFive,
    });
  } catch (error) {
    console.error(`Error in /api/stocks/key-metrics`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export {
  getMarketData,
  getMarketMovers,
  getStocksTopVolumeTraded,
  getStocksKeyMetrics,
};
