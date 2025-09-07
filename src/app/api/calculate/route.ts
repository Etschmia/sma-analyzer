// src/app/api/calculate/route.ts

import { NextResponse } from 'next/server';

// Definiere eine Schnittstelle für die ankommenden Daten vom Frontend
interface RequestBody {
  symbol: string;
  days: number;
}

export async function POST(request: Request) {
  try {
    // 1. Lese und validiere die Daten aus der Anfrage
    const body: RequestBody = await request.json();
    const { symbol, days } = body;

    if (!symbol || !days) {
      return NextResponse.json({ error: 'Symbol and days are required' }, { status: 400 });
    }

    // 2. Hole den API-Schlüssel sicher aus den Umgebungsvariablen
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
    }

    // 3. Baue die URL für die Alpha Vantage API zusammen
    // 'outputsize=full' holt die komplette verfügbare Historie
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=full&apikey=${apiKey}`;

    // 4. Rufe die externen Daten ab
    const apiResponse = await fetch(url);
    if (!apiResponse.ok) {
      // Wirft einen Fehler, wenn die Antwort nicht erfolgreich war (z.B. 404, 500)
      throw new Error(`Alpha Vantage API request failed with status ${apiResponse.status}`);
    }
    const data = await apiResponse.json();
    
    // Alpha Vantage gibt eine Fehlermeldung im JSON zurück, wenn etwas schiefgeht (z.B. ungültiger Ticker)
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    // 5. Sende die (noch unbearbeiteten) Daten zurück an das Frontend
    return NextResponse.json(data);

  } catch (error) {
    // 6. Fange alle Fehler ab und sende eine saubere Fehlermeldung
    console.error('API Route Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}