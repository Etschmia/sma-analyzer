// src/app/page.tsx

import SettingsPanel from './components/SettingsPanel';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-12">
      <div className="z-10 w-full max-w-7xl items-center justify-between font-mono text-sm lg:flex mb-8">
        <h1 className="text-4xl font-bold">SMA Crossover Analyse</h1>
      </div>

      <div className="w-full max-w-7xl">
        <SettingsPanel />
      </div>

      {/* Hier wird später das Diagramm angezeigt */}
      <div id="chart-container" className="w-full max-w-7xl mt-8">
        {/* Chart goes here */}
      </div>
    </main>
  );
}