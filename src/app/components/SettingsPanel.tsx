// src/app/components/SettingsPanel.tsx

'use client';

import { useState, useEffect } from 'react';

const indices = [
  { name: 'DAX', symbol: '^GDAXI' },
  { name: 'Euro Stoxx 50', symbol: '^STOXX50E' },
  { name: 'NASDAQ 100', symbol: 'QQQ' },
  { name: 'S&P 500', symbol: 'SPY' },
  { name: 'Nikkei 225', symbol: '^N225' },
];

interface Settings {
  symbol: string;
  shortSMA: number;
  longSMA: number;
  days: number;
}

const defaultSettings: Settings = {
  symbol: indices[0].symbol,
  shortSMA: 190,
  longSMA: 212,
  days: 365,
};

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Lädt die Daten einmalig vom Client
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('smaAnalyzerSettings');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error("Fehler beim Laden der Einstellungen:", error);
    }
  }, []);

  // Speichert die Daten bei jeder Änderung
  useEffect(() => {
    try {
      localStorage.setItem('smaAnalyzerSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Fehler beim Speichern der Einstellungen:", error);
    }
  }, [settings]);

  const handleAnalyse = () => {
    console.log("Analyse gestartet mit:", settings);
  };

  const updateSetting = (key: keyof Settings, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Einstellungen</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="flex flex-col">
          <label htmlFor="index" className="mb-1 font-semibold text-gray-700">Index</label>
          <select
            id="index"
            value={settings.symbol}
            onChange={(e) => updateSetting('symbol', e.target.value)}
            // KORREKTUR HINZUGEFÜGT
            className="p-2 border border-gray-300 rounded-md text-gray-900"
          >
            {indices.map((index) => (
              <option key={index.symbol} value={index.symbol}>
                {index.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="shortSMA" className="mb-1 font-semibold text-gray-700">Kurzer SMA</label>
          <input
            type="number"
            id="shortSMA"
            value={settings.shortSMA}
            onChange={(e) => updateSetting('shortSMA', Number(e.target.value))}
            // KORREKTUR HINZUGEFÜGT
            className="p-2 border border-gray-300 rounded-md text-gray-900"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="longSMA" className="mb-1 font-semibold text-gray-700">Langer SMA</label>
          <input
            type="number"
            id="longSMA"
            value={settings.longSMA}
            onChange={(e) => updateSetting('longSMA', Number(e.target.value))}
            // KORREKTUR HINZUGEFÜGT
            className="p-2 border border-gray-300 rounded-md text-gray-900"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="days" className="mb-1 font-semibold text-gray-700">Zeitraum (Tage)</label>
          <input
            type="number"
            id="days"
            value={settings.days}
            onChange={(e) => updateSetting('days', Number(e.target.value))}
            // KORREKTUR HINZUGEFÜGT
            className="p-2 border border-gray-300 rounded-md text-gray-900"
          />
        </div>

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