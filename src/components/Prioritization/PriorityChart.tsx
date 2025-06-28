'use client';

import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { PriorityWeight } from '@/types';

Chart.register(...registerables);

interface PriorityChartProps {
  priorities: PriorityWeight[];
}

export default function PriorityChart({ priorities }: PriorityChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create chart configuration
    const config: ChartConfiguration = {
      type: 'radar',
      data: {
        labels: priorities.map(p => p.description),
        datasets: [
          {
            label: 'Priority Weights',
            data: priorities.map(p => p.weight),
            backgroundColor: 'rgba(66, 133, 244, 0.2)',
            borderColor: 'rgba(66, 133, 244, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(66, 133, 244, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(66, 133, 244, 1)'
          }
        ]
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 5,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };

    // Create new chart
    chartInstance.current = new Chart(chartRef.current, config);

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [priorities]);

  return (
    <div className="bg-white p-4 rounded-lg border">
      <canvas ref={chartRef} />
    </div>
  );
}