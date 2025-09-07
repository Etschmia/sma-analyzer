// src/app/api/calculate/route.ts

import { NextResponse } from 'next/server';

type ApiProvider = 'alpha-vantage' | 'finnhub';

interface RequestBody {
  symbol: string;
  shortSMA: number;
  longSMA: number;
  days: number;
  apiProvider: ApiProvider;
  apiKey?: string;
}

// Typen für unsere sauberen, verarbeiteten Daten
export interface ChartData {
  date: string;
  close: number;
  shortSMA: number | null;
  longSMA: number | null;
}

export interface CrossoverEvent {
  date: string;
  type: 'bullish' | 'bearish';
}

export interface AnalysisResult {
  chartData: ChartData[];
  crossoverEvents: CrossoverEvent[];
}

async function fetchAlphaVantageData(symbol: string, apiKey: string): Promise<{ date: string, close: number }[]> {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${apiKey}`;

  const apiResponse = await fetch(url);
  if (!apiResponse.ok) {
    throw new Error(`Alpha Vantage API request failed with status ${apiResponse.status}`);
  }
  const rawData = await apiResponse.json();

  if (rawData['Error Message'] || !rawData['Time Series (Daily)']) {
    throw new Error(rawData['Note'] || rawData['Error Message'] || 'Invalid data received from Alpha Vantage API. Check the stock symbol or API key.');
  }

  const timeSeries = rawData['Time Series (Daily)'] as Record<string, { '4. close': string }>;
  return Object.entries(timeSeries)
    .map(([date, values]) => ({
      date,
      close: parseFloat(values['4. close']),
    }))
    .reverse();
}

async function fetchFinnhubData(symbol: string, apiKey: string): Promise<{ date: string, close: number }[]> {
  const to = Math.floor(Date.now() / 1000);
  const from = to - (365 * 2 * 24 * 60 * 60); // Fetch 2 years of data to have enough for SMA calculation

  const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${apiKey}`;

  const apiResponse = await fetch(url);
  if (!apiResponse.ok) {
    throw new Error(`Finnhub API request failed with status ${apiResponse.status}`);
  }
  const rawData = await apiResponse.json();

  if (rawData.s !== 'ok') {
    throw new Error(rawData.errmsg || 'Invalid data received from Finnhub API. Check the stock symbol or API key.');
  }

  return rawData.t.map((timestamp: number, index: number) => ({
    date: new Date(timestamp * 1000).toISOString().split('T')[0],
    close: rawData.c[index],
  }));
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { symbol, shortSMA, longSMA, days, apiProvider, apiKey: clientApiKey } = body;

    if (!symbol || !shortSMA || !longSMA || !days || !apiProvider) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    let apiKey: string | undefined;
    if (apiProvider === 'alpha-vantage') {
      apiKey = clientApiKey || process.env.ALPHA_VANTAGE_API_KEY;
    } else if (apiProvider === 'finnhub') {
      apiKey = clientApiKey || process.env.FINNHUB_API_KEY;
    }

    if (!apiKey) {
      return NextResponse.json({ error: `API key for ${apiProvider} is not configured` }, { status: 500 });
    }

    let dailyData: { date: string, close: number }[];

    if (apiProvider === 'alpha-vantage') {
      dailyData = await fetchAlphaVantageData(symbol, apiKey);
    } else if (apiProvider === 'finnhub') {
      dailyData = await fetchFinnhubData(symbol, apiKey);
    } else {
      return NextResponse.json({ error: 'Invalid API provider' }, { status: 400 });
    }

    const dataWithSMAs = calculateSMAs(dailyData, shortSMA, longSMA);
    const crossoverEvents = findCrossovers(dataWithSMAs);
    const slicedChartData = dataWithSMAs.slice(-days);

    const result: AnalysisResult = {
      chartData: slicedChartData,
      crossoverEvents,
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('API Route Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Hilfsfunktion zur SMA-Berechnung
function calculateSMAs(data: { date: string, close: number }[], shortPeriod: number, longPeriod: number): ChartData[] {
  return data.map((day, index, arr) => {
    let shortSMA: number | null = null;
    if (index >= shortPeriod - 1) {
      const sum = arr.slice(index - shortPeriod + 1, index + 1).reduce((acc, val) => acc + val.close, 0);
      shortSMA = sum / shortPeriod;
    }

    let longSMA: number | null = null;
    if (index >= longPeriod - 1) {
      const sum = arr.slice(index - longPeriod + 1, index + 1).reduce((acc, val) => acc + val.close, 0);
      longSMA = sum / longPeriod;
    }

    return { ...day, shortSMA, longSMA };
  });
}

// Hilfsfunktion zur Crossover-Erkennung
function findCrossovers(data: ChartData[]): CrossoverEvent[] {
  const events: CrossoverEvent[] = [];
  for (let i = 1; i < data.length; i++) {
    const prev = data[i-1];
    const curr = data[i];

    if (prev.shortSMA && prev.longSMA && curr.shortSMA && curr.longSMA) {
      // Bullish Crossover: Kurzer SMA war UNTER dem langen und ist jetzt ÜBER dem langen
      if (prev.shortSMA < prev.longSMA && curr.shortSMA > curr.longSMA) {
        events.push({ date: curr.date, type: 'bullish' });
      }
      // Bearish Crossover: Kurzer SMA war ÜBER dem langen und ist jetzt UNTER dem langen
      if (prev.shortSMA > prev.longSMA && curr.shortSMA < curr.longSMA) {
        events.push({ date: curr.date, type: 'bearish' });
      }
    }
  }
  return events;
}