// dataFetcher.js

import axios from "axios";
import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import { fileURLToPath } from "url";

const API_KEY = "KKVJSEMG0QNQLLOA";
export const NASDAQ_100_SYMBOLS = [
  "MSFT",
  //   "AAPL",
  //   "NVDA",
  //   "AMZN",
  //   "META",
  //   "AVGO",
  //   "TSLA",
  //   "COST",
  //   "GOOGL",
  //   "GOOG",
  //   "AMD",
  //   "NFLX",
  //   "ADBE",
  //   "PEP",
  //   "CSCO",
  //   "TMUS",
  //   "INTU",
  //   "INTC",
  //   "QCOM",
  //   "AMAT",
  //   "CMCSA",
  //   "AMGN",
  //   "TXN",
  //   "ISRG",
  //   "HON",
  //   "LRCX",
  //   "BKNG",
  //   "VRTX",
  //   "SBUX",
  //   "REGN",
  //   "ADP",
  //   "MDLZ",
  //   "MU",
  //   "PANW",
  //   "ADI",
  //   "KLAC",
  //   "GILD",
  //   "SNPS",
  //   "PDD",
  //   "ASML",
  //   "CDNS",
  //   "MELI",
  //   "CSX",
  //   "MAR",
  //   "CRWD",
  //   "ABNB",
  //   "CTAS",
  //   "WDAY",
  //   "PYPL",
  //   "NXPI",
  //   "ORLY",
  //   "MRVL",
  //   "PCAR",
  //   "ROP",
  //   "MNST",
  //   "LULU",
  //   "ADSK",
  //   "FTNT",
  //   "CPRT",
  //   "ROST",
  //   "ODFL",
  //   "IDXX",
  //   "DXCM",
  //   "MCHP",
  //   "PAYX",
  //   "DASH",
  //   "KHC",
  //   "CHTR",
  //   "CEG",
  //   "AEP",
  //   "FAST",
  //   "GEHC",
  //   "KDP",
  //   "CTSH",
  //   "DDOG",
  //   "AZN",
  //   "EA",
  //   "TTD",
  //   "MRNA",
  //   "ZS",
  //   "EXC",
  //   "VRSK",
  //   "CSGP",
  //   "ON",
  //   "CDW",
  //   "CCEP",
  //   "BIIB",
  //   "MDB",
  //   "XEL",
  //   "DLTR",
  //   "TEAM",
  //   "FANG",
  //   "BKR",
  //   "GFS",
  //   "ANSS",
  //   "SPLK",
  //   "TTWO",
  //   "ILMN",
  //   "WBD",
  //   "SIRI",
  //   "WBA",
];
const RATE_LIMIT_DELAY_MS = 15000; // Alpha Vantage free tier allows 5 API requests per minute

// Get the __dirname equivalent by using new URL() and fileURLToPath
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_DIR = path.resolve(path.join(__dirname, "data"));

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Function to fetch data for a given symbol from Alpha Vantage API
async function fetchDataForSymbol(symbol) {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${API_KEY}`;
  try {
    const response = await axios.get(url);
    console.log(response);
    if (response.data) {
      console.log(`Data fetched for ${symbol}`);
      // You will need to modify this based on the actual structure of the response
      return response.data["Time Series (5min)"];
    } else {
      console.error(`No data for ${symbol}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return null;
  }
}

// Save the fetched data to a CSV file for a symbol
async function saveToCSV(data, symbol) {
  const csvWriter = createObjectCsvWriter({
    path: path.join(DATA_DIR, `${symbol}.csv`),
    header: [
      { id: "timestamp", title: "TIMESTAMP" },
      { id: "open", title: "OPEN" },
      { id: "high", title: "HIGH" },
      { id: "low", title: "LOW" },
      { id: "close", title: "CLOSE" },
      { id: "volume", title: "VOLUME" },
    ],
  });

  const records = Object.entries(data).map(([timestamp, value]) => {
    return {
      timestamp,
      open: value["1. open"],
      high: value["2. high"],
      low: value["3. low"],
      close: value["4. close"],
      volume: value["5. volume"],
    };
  });

  await csvWriter.writeRecords(records);
  console.log(`CSV for ${symbol} saved.`);
}

// Function to fetch data for all symbols and save each symbol's data to CSV
export async function fetchAllData() {
  // Keep a counter of the requests
  let requestCounter = 0;

  for (const symbol of NASDAQ_100_SYMBOLS) {
    const data = await fetchDataForSymbol(symbol);
    if (data) {
      await saveToCSV(data, symbol);
      console.log(`CSV for ${symbol} saved.`);

      // Increment the request counter
      requestCounter++;

      // If we have hit a multiple of 5, enforce a delay
      if (requestCounter % 5 === 0) {
        console.log(`Reached API call limit, taking a break...`);
        await new Promise((resolve) =>
          setTimeout(resolve, RATE_LIMIT_DELAY_MS)
        );
      }
    }
  }
}
