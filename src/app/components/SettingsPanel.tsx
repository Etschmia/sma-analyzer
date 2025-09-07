// src/app/components/SettingsPanel.tsx

'use client';

import { useState, useEffect } from 'react';
import { AnalysisResult } from '../api/calculate/route';
import ChartComponent from './ChartComponent';

const indices = [
  { name: 'DAX', symbol: 'DAX.PAR' },
  { name: 'Euro Stoxx 50', symbol: 'SXRT.DEX' },
  { name: 'NASDAQ 100', symbol: 'QQQ' },
  { name: 'S&P 500', symbol: 'SPY' },
  { name: 'Nikkei 225', symbol: 'EXX7.DEX' },
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

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

  useEffect(() => {
    try {
      localStorage.setItem('smaAnalyzerSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Fehler beim Speichern der Einstellungen:", error);
    }
  }, [settings]);

  const handleAnalyse = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ein unbekannter Fehler ist aufgetreten.');
      }
      
      setAnalysisResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Verbindungsfehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof Settings, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <div className="p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Einstellungen</h2>
        {/* DIESER TEIL HAT GEFEHLT UND IST JETZT WIEDER DA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex flex-col">
            <label htmlFor="index" className="mb-1 font-semibold text-gray-700">Index</label>
            <select
              id="index"
              value={settings.symbol}
              onChange={(e) => updateSetting('symbol', e.target.value)}
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
              className="p-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAnalyse}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isLoading ? 'Lade...' : 'Analyse starten'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-7xl mt-8 p-4 bg-white rounded-lg shadow-md">
        {isLoading && <p className="text-center text-gray-500">Daten werden geladen und berechnet...</p>}
        {error && <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md"><p><strong>Fehler:</strong> {error}</p></div>}
        
        {analysisResult && (
          <div>
            <ChartComponent result={analysisResult} />
          </div>
        )}

        {!isLoading && !error && !analysisResult && (
          <div className="text-center text-gray-400 py-16">
            <p>Bitte wähle deine Einstellungen und starte die Analyse.</p>
          </div>
        )}
      </div>
    </>
  );
}