// app/components/SettingsPanel.tsx

'use client'; // Wichtig: Macht dies zu einer Client-Komponente

import { useState } from 'react';

// Definiere die Symbole und ihre Ticker für die Auswahl
const indices = [
  { name: 'DAX', symbol: '^GDAXI' },
  { name: 'Euro Stoxx 50', symbol: '^STOXX50E' },
  { name: 'NASDAQ 100', symbol: 'QQQ' }, // ETF ist oft einfacher abzufragen
  { name: 'S&P 500', symbol: 'SPY' },   // ETF ist oft einfacher abzufragen
  { name: 'Nikkei 225', symbol: '^N225' },
];

export default function SettingsPanel() {
  // States für die einzelnen Eingabefelder mit Standardwerten
  const [shortSMA, setShortSMA] = useState(190);
  const [longSMA, setLongSMA] = useState(212);
  const [days, setDays] = useState(365);
  const [selectedIndex, setSelectedIndex] = useState(indices[0].symbol);

  const handleAnalyse = () => {
    // Diese Funktion wird später die Analyse starten
    console.log({
      symbol: selectedIndex,
      shortSMA,
      longSMA,
      days,
    });
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Einstellungen</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

        {/* Index Auswahl */}
        <div className="flex flex-col">
          <label htmlFor="index" className="mb-1 font-semibold text-gray-700">Index</label>
          <select
            id="index"
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            {indices.map((index) => (
              <option key={index.symbol} value={index.symbol}>
                {index.name}
              </option>
            ))}
          </select>
        </div>

        {/* Kurzer SMA */}
        <div className="flex flex-col">
          <label htmlFor="shortSMA" className="mb-1 font-semibold text-gray-700">Kurzer SMA</label>
          <input
            type="number"
            id="shortSMA"
            value={shortSMA}
            onChange={(e) => setShortSMA(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Langer SMA */}
        <div className="flex flex-col">
          <label htmlFor="longSMA" className="mb-1 font-semibold text-gray-700">Langer SMA</label>
          <input
            type="number"
            id="longSMA"
            value={longSMA}
            onChange={(e) => setLongSMA(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Zeitraum */}
        <div className="flex flex-col">
          <label htmlFor="days" className="mb-1 font-semibold text-gray-700">Zeitraum (Tage)</label>
          <input
            type="number"
            id="days"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Button */}
        <div className="flex items-end">
            <button
            onClick={handleAnalyse}
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
            >
            Analyse starten
            </button>
        </div>
      </div>
    </div>
  );
}
