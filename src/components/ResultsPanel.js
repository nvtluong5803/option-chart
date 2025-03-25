import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ResultsPanel.css';

const ResultsPanel = ({ optionPrice, greeks, priceChartData, volatilityChartData, deltaVolatilityData }) => {
  const [activeTab, setActiveTab] = useState('premium');

  // Generate colors for volatility chart lines
  const getLineColor = (index, total) => {
    // Color gradient from blue to red
    const hue = 240 - (index / (total - 1)) * 240;
    return `hsl(${hue}, 80%, 50%)`;
  };

  return (
    <div className="results-panel">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'premium' ? 'active' : ''}`}
          onClick={() => setActiveTab('premium')}
        >
          Option Premium & Greeks
        </button>
        <button 
          className={`tab ${activeTab === 'chart' ? 'active' : ''}`}
          onClick={() => setActiveTab('chart')}
        >
          Price vs. Volatility Chart
        </button>
        <button 
          className={`tab ${activeTab === 'delta' ? 'active' : ''}`}
          onClick={() => setActiveTab('delta')}
        >
          Delta vs. Volatility
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'premium' && (
          <div className="premium-tab">
            <div className="premium-box">
              <h3>Option Premium</h3>
              <div className="premium-value">${optionPrice.toFixed(2)}</div>
            </div>
            
            <div className="greeks-container">
              <h3>Greeks</h3>
              <div className="greeks-grid">
                <div className="greek-item">
                  <div className="greek-name">Delta (Δ)</div>
                  <div className="greek-value">{greeks.delta.toFixed(4)}</div>
                </div>
                <div className="greek-item">
                  <div className="greek-name">Gamma (Γ)</div>
                  <div className="greek-value">{greeks.gamma.toFixed(4)}</div>
                </div>
                <div className="greek-item">
                  <div className="greek-name">Theta (Θ)</div>
                  <div className="greek-value">{greeks.theta.toFixed(4)}</div>
                </div>
                <div className="greek-item">
                  <div className="greek-name">Vega (ν)</div>
                  <div className="greek-value">{greeks.vega.toFixed(4)}</div>
                </div>
                <div className="greek-item">
                  <div className="greek-name">Rho (ρ)</div>
                  <div className="greek-value">{greeks.rho.toFixed(4)}</div>
                </div>
              </div>
              <div className="greeks-explanation">
                <p><strong>Delta:</strong> Rate of change of option price with respect to underlying price</p>
                <p><strong>Gamma:</strong> Rate of change of delta with respect to underlying price</p>
                <p><strong>Theta:</strong> Rate of change of option price with respect to time (per day)</p>
                <p><strong>Vega:</strong> Rate of change of option price with respect to volatility (per 1% change)</p>
                <p><strong>Rho:</strong> Rate of change of option price with respect to interest rate (per 1% change)</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chart' && (
          <div className="chart-tab">
            <h3>Option Price vs. Underlying Price for Different Volatilities</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="underlyingPrice" 
                    type="number" 
                    domain={['dataMin', 'dataMax']} 
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                    label={{ value: 'Underlying Price ($)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                    label={{ value: 'Option Price ($)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Option Price']}
                    labelFormatter={(value) => `Underlying Price: $${value.toFixed(2)}`}
                  />
                  <Legend />
                  
                  {volatilityChartData.map((series, index) => (
                    <Line
                      key={`vol-${series.volatility}`}
                      data={series.data}
                      type="monotone"
                      dataKey="optionPrice"
                      name={`Volatility: ${(series.volatility * 100).toFixed(0)}%`}
                      stroke={getLineColor(index, volatilityChartData.length)}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'delta' && (
          <div className="chart-tab">
            <h3>Delta vs. Volatility (At-the-Money)</h3>
            <p className="chart-description">
              This chart shows how Delta changes with volatility when the underlying price equals the strike price.
            </p>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={deltaVolatilityData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="volatility" 
                    type="number" 
                    domain={['dataMin', 'dataMax']} 
                    tickFormatter={(value) => `${value.toFixed(0)}%`}
                    label={{ value: 'Volatility (%)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    domain={[0, 1]}
                    tickFormatter={(value) => value.toFixed(2)}
                    label={{ value: 'Delta', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value) => [value.toFixed(4), 'Delta']}
                    labelFormatter={(value) => `Volatility: ${value.toFixed(1)}%`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="delta"
                    name="Delta"
                    stroke="#8884d8"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;
