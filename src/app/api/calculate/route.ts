// src/app/api/calculate/route.ts

import { NextResponse } from 'next/server';

interface RequestBody {
  symbol: string;
  shortSMA: number;
  longSMA: number;
  days: number;
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


export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    
    const { symbol, shortSMA, longSMA, days } = body;

    if (!symbol || !shortSMA || !longSMA || !days) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
    }

    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${apiKey}`;
    
    const apiResponse = await fetch(url);
    if (!apiResponse.ok) {
      throw new Error(`Alpha Vantage API request failed with status ${apiResponse.status}`);
    }
    const rawData = await apiResponse.json();
    console.log('Antwort von Alpha Vantage:', rawData);
    
    if (rawData['Error Message'] || !rawData['Time Series (Daily)']) {
      throw new Error(rawData['Error Message'] || 'Invalid data received from API. Check the stock symbol.');
    }

    // --- AB HIER STARTET DIE NEUE BERECHNUNGSLOGIK ---

    // 1. Rohdaten in ein sauberes, chronologisches Array umwandeln
    const timeSeries = rawData['Time Series (Daily)'];
    const dailyData = Object.entries(timeSeries)
      .map(([date, values]: [string, any]) => ({
        date,
        close: parseFloat(values['4. close']),
      }))
      .reverse(); // Wichtig: API liefert antichronologisch, wir drehen es um

    // 2. SMAs berechnen
    const dataWithSMAs = calculateSMAs(dailyData, shortSMA, longSMA);

    // 3. Crossovers identifizieren
    const crossoverEvents = findCrossovers(dataWithSMAs);
    
    // 4. Daten auf den gewünschten Zeitraum zuschneiden
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