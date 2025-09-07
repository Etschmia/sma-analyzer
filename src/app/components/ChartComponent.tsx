// src/app/components/ChartComponent.tsx

'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { AnalysisResult } from '../api/calculate/route';

// Wichtig: Chart.js-Module registrieren
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartComponentProps {
  result: AnalysisResult;
}

export default function ChartComponent({ result }: ChartComponentProps) {
  const { chartData, crossoverEvents } = result;

  // Filtere die Events, die im sichtbaren Chart-Bereich liegen
  const visibleDates = new Set(chartData.map(d => d.date));
  const visibleCrossovers = crossoverEvents.filter(event => visibleDates.has(event.date));

  // Daten für Chart.js aufbereiten
  const data = {
    labels: chartData.map(d => d.date), // X-Achse: Datum
    datasets: [
      {
        label: 'Schlusskurs',
        data: chartData.map(d => d.close),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderWidth: 2,
        pointRadius: 0, // Keine Punkte auf der Hauptlinie
      },
      {
        label: `SMA (${chartData.filter(d => d.shortSMA !== null).length > 0 ? result.chartData.find(d => d.shortSMA !== null)?.shortSMA?.toFixed(0) : 'N/A'})`,
        data: chartData.map(d => d.shortSMA),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 1.5,
        pointRadius: 0,
      },
      {
        label: `SMA (${chartData.filter(d => d.longSMA !== null).length > 0 ? result.chartData.find(d => d.longSMA !== null)?.longSMA?.toFixed(0) : 'N/A'})`,
        data: chartData.map(d => d.longSMA),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 1.5,
        pointRadius: 0,
      },
      // Datensatz für bullishe Crossover-Punkte
      {
        label: 'Bullish Crossover',
        data: chartData.map(d => 
          visibleCrossovers.find(e => e.date === d.date && e.type === 'bullish') ? d.close : null
        ),
        pointStyle: 'triangle',
        pointRadius: 8,
        pointBackgroundColor: 'rgba(4, 255, 0, 0.8)',
        borderColor: 'rgba(4, 255, 0, 1)',
        showLine: false,
      },
      // Datensatz für bearishe Crossover-Punkte
      {
        label: 'Bearish Crossover',
        data: chartData.map(d => 
          visibleCrossovers.find(e => e.date === d.date && e.type === 'bearish') ? d.close : null
        ),
        pointStyle: 'triangle',
        rotation: 180,
        pointRadius: 8,
        pointBackgroundColor: 'rgba(255, 0, 0, 0.8)',
        borderColor: 'rgba(255, 0, 0, 1)',
        showLine: false,
      }
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'SMA Crossover Analyse',
      },
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 15, // Sorgt für eine aufgeräumte X-Achse
        }
      }
    }
  };

  return <Line options={options} data={data} />;
}