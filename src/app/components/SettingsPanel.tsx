// src/app/components/SettingsPanel.tsx

'use client';

import { useState, useEffect } from 'react';
import { AnalysisResult } from '../api/calculate/route';
import ChartComponent from './ChartComponent';

type ApiProvider = 'alpha-vantage' | 'finnhub';

const indices: Record<ApiProvider, { name: string; symbol: string }[]> = {
  'alpha-vantage': [
    { name: 'DAX', symbol: 'DAX.PAR' },
    { name: 'Euro Stoxx 50', symbol: 'SXRT.DEX' },
    { name: 'NASDAQ 100', symbol: 'QQQ' },
    { name: 'S&P 500', symbol: 'SPY' },
    { name: 'Nikkei 225', symbol: 'EXX7.DEX' },
  ],
  'finnhub': [
    { name: 'DAX', symbol: '^GDAXI' },
    { name: 'Euro Stoxx 50', symbol: '^STOXX50E' },
    { name: 'NASDAQ 100', symbol: '^NDX' },
    { name: 'S&P 500', symbol: '^GSPC' },
    { name: 'Nikkei 225', symbol: '^N225' },
  ],
};

interface Settings {
  symbol: string;
  shortSMA: number;
  longSMA: number;
  days: number;
  apiProvider: ApiProvider;
}

const defaultSettings: Settings = {
  symbol: indices['alpha-vantage'][0].symbol,
  shortSMA: 190,
  longSMA: 212,
  days: 365,
  apiProvider: 'alpha-vantage',
};

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [alphaVantageApiKey, setAlphaVantageApiKey] = useState('');
  const [finnhubApiKey, setFinnhubApiKey] = useState('');

  const [showAlphaVantageKeyInput, setShowAlphaVantageKeyInput] = useState(false);
  const [showFinnhubKeyInput, setShowFinnhubKeyInput] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('smaAnalyzerSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings({ ...defaultSettings, ...parsedSettings });
    }

    const avKey = localStorage.getItem('alphaVantageApiKey');
    if (avKey) setAlphaVantageApiKey(avKey);

    const fhKey = localStorage.getItem('finnhubApiKey');
    if (fhKey) setFinnhubApiKey(fhKey);

    // Initial check for API keys based on environment variables
    // This is a bit tricky on the client side, we'll pass this info from the server
    // For now, we assume we need to show the input if no key is in local storage
    setShowAlphaVantageKeyInput(!avKey);
    setShowFinnhubKeyInput(!fhKey);

  }, []);

  useEffect(() => {
    localStorage.setItem('smaAnalyzerSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (alphaVantageApiKey) localStorage.setItem('alphaVantageApiKey', alphaVantageApiKey);
  }, [alphaVantageApiKey]);

  useEffect(() => {
    if (finnhubApiKey) localStorage.setItem('finnhubApiKey', finnhubApiKey);
  }, [finnhubApiKey]);

  const handleAnalyse = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    const apiKey = settings.apiProvider === 'alpha-vantage' ? alphaVantageApiKey : finnhubApiKey;

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...settings, apiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error.includes("API key is not configured") || data.error.includes("Invalid API key")) {
          if (settings.apiProvider === 'alpha-vantage') setShowAlphaVantageKeyInput(true);
          if (settings.apiProvider === 'finnhub') setShowFinnhubKeyInput(true);
        }
        throw new Error(data.error || 'Ein unbekannter Fehler ist aufgetreten.');
      }
      
      setAnalysisResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Verbindungsfehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof Settings, value: string | number | ApiProvider) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      if (key === 'apiProvider') {
        newSettings.symbol = indices[value as ApiProvider][0].symbol;
      }
      return newSettings;
    });
  };

  const currentIndices = indices[settings.apiProvider];

  return (
    <>
      <div className="p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Einstellungen</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col">
            <label htmlFor="apiProvider" className="mb-1 font-semibold text-gray-700">API Provider</label>
            <select
              id="apiProvider"
              value={settings.apiProvider}
              onChange={(e) => updateSetting('apiProvider', e.target.value as ApiProvider)}
              className="p-2 border border-gray-300 rounded-md text-gray-900"
            >
              <option value="alpha-vantage">Alpha Vantage</option>
              <option value="finnhub">Finnhub.io</option>
            </select>
          </div>
        </div>

        { (settings.apiProvider === 'alpha-vantage' && showAlphaVantageKeyInput) && (
          <div className="mb-4">
            <label htmlFor="alphaVantageApiKey" className="block mb-1 font-semibold text-gray-700">Alpha Vantage API Key</label>
            <input
              type="text"
              id="alphaVantageApiKey"
              value={alphaVantageApiKey}
              onChange={(e) => setAlphaVantageApiKey(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-gray-900 w-full"
              placeholder="Geben Sie Ihren Alpha Vantage API Key ein"
            />
          </div>
        )}

        { (settings.apiProvider === 'finnhub' && showFinnhubKeyInput) && (
          <div className="mb-4">
            <label htmlFor="finnhubApiKey" className="block mb-1 font-semibold text-gray-700">Finnhub.io API Key</label>
            <input
              type="text"
              id="finnhubApiKey"
              value={finnhubApiKey}
              onChange={(e) => setFinnhubApiKey(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-gray-900 w-full"
              placeholder="Geben Sie Ihren Finnhub.io API Key ein"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex flex-col">
            <label htmlFor="index" className="mb-1 font-semibold text-gray-700">Index</label>
            <select
              id="index"
              value={settings.symbol}
              onChange={(e) => updateSetting('symbol', e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-gray-900"
            >
              {currentIndices.map((index) => (
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