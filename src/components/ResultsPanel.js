import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import NormalDistribution from './NormalDistribution';
import BrownianMotion from './BrownianMotion';
import './ResultsPanel.css';

const ResultsPanel = ({ optionPrice, greeks, priceChartData, volatilityChartData, deltaUnderlyingData, parameters }) => {
  const [activeTab, setActiveTab] = useState('premium');

  // Generate colors for chart lines
  const getLineColor = (index, total) => {
    // Color gradient from blue to red
    const hue = 240 - (index / (total - 1)) * 240;
    return `hsl(${hue}, 80%, 50%)`;
  };

  // Function to calculate d1 and d2 for formula display
  const calculateD1D2 = () => {
    const { optionType, underlyingPrice, strikePrice, timeToMaturity, volatility, riskFreeRate } = parameters;
    const S = underlyingPrice;
    const K = strikePrice;
    const r = riskFreeRate;
    const T = timeToMaturity;
    const sigma = volatility;
    
    const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    
    return { d1, d2 };
  };

  // Calculate d1 and d2 for the formula display
  const { d1, d2 } = calculateD1D2();

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
          className={`tab ${activeTab === 'price' ? 'active' : ''}`}
          onClick={() => setActiveTab('price')}
        >
          Price vs. Underlying
        </button>
        <button 
          className={`tab ${activeTab === 'delta' ? 'active' : ''}`}
          onClick={() => setActiveTab('delta')}
        >
          Delta vs. Underlying
        </button>
        <button 
          className={`tab ${activeTab === 'formula' ? 'active' : ''}`}
          onClick={() => setActiveTab('formula')}
        >
          Black-Scholes Formula
        </button>
        <button 
          className={`tab ${activeTab === 'normal' ? 'active' : ''}`}
          onClick={() => setActiveTab('normal')}
        >
          Normal Distribution
        </button>
        <button 
          className={`tab ${activeTab === 'brownian' ? 'active' : ''}`}
          onClick={() => setActiveTab('brownian')}
        >
          Brownian Motion
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

        {activeTab === 'price' && (
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
            <h3>Delta vs. Underlying Price for Different Volatilities</h3>
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
                    domain={[0, 1]}
                    tickFormatter={(value) => value.toFixed(2)}
                    label={{ value: 'Delta', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value) => [value.toFixed(4), 'Delta']}
                    labelFormatter={(value) => `Underlying Price: $${value.toFixed(2)}`}
                  />
                  <Legend />
                  
                  {deltaUnderlyingData.map((series, index) => (
                    <Line
                      key={`vol-${series.volatility}`}
                      data={series.data}
                      type="monotone"
                      dataKey="delta"
                      name={`Volatility: ${(series.volatility * 100).toFixed(0)}%`}
                      stroke={getLineColor(index, deltaUnderlyingData.length)}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'formula' && (
          <div className="formula-tab">
            <h3>Black-Scholes Option Pricing Formula</h3>
            
            <div className="formula-container">
              <div className="formula-section">
                <h4>Call Option Price:</h4>
                <div className="formula">
                  C = S × N(d₁) - K × e<sup>-rT</sup> × N(d₂)
                </div>
                <div className="formula-calculation">
                  C = {parameters.underlyingPrice.toFixed(2)} × N({d1.toFixed(4)}) - {parameters.strikePrice.toFixed(2)} × e<sup>-{parameters.riskFreeRate.toFixed(2)}×{parameters.timeToMaturity.toFixed(2)}</sup> × N({d2.toFixed(4)})
                </div>
              </div>
              
              <div className="formula-section">
                <h4>Put Option Price:</h4>
                <div className="formula">
                  P = K × e<sup>-rT</sup> × N(-d₂) - S × N(-d₁)
                </div>
                <div className="formula-calculation">
                  P = {parameters.strikePrice.toFixed(2)} × e<sup>-{parameters.riskFreeRate.toFixed(2)}×{parameters.timeToMaturity.toFixed(2)}</sup> × N({(-d2).toFixed(4)}) - {parameters.underlyingPrice.toFixed(2)} × N({(-d1).toFixed(4)})
                </div>
              </div>
              
              <div className="formula-section">
                <h4>Where:</h4>
                <div className="formula">
                  d₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T)
                </div>
                <div className="formula-calculation">
                  d₁ = [ln({parameters.underlyingPrice.toFixed(2)}/{parameters.strikePrice.toFixed(2)}) + ({parameters.riskFreeRate.toFixed(2)} + {parameters.volatility.toFixed(2)}²/2) × {parameters.timeToMaturity.toFixed(2)}] / ({parameters.volatility.toFixed(2)} × √{parameters.timeToMaturity.toFixed(2)}) = {d1.toFixed(4)}
                </div>
                
                <div className="formula">
                  d₂ = d₁ - σ√T
                </div>
                <div className="formula-calculation">
                  d₂ = {d1.toFixed(4)} - {parameters.volatility.toFixed(2)} × √{parameters.timeToMaturity.toFixed(2)} = {d2.toFixed(4)}
                </div>
              </div>
              
              <div className="formula-section">
                <h4>Parameters:</h4>
                <ul className="parameter-list">
                  <li><strong>S = {parameters.underlyingPrice.toFixed(2)}</strong>: Current underlying price</li>
                  <li><strong>K = {parameters.strikePrice.toFixed(2)}</strong>: Strike price</li>
                  <li><strong>r = {parameters.riskFreeRate.toFixed(2)}</strong>: Risk-free interest rate (decimal form)</li>
                  <li><strong>T = {parameters.timeToMaturity.toFixed(2)}</strong>: Time to maturity (in years)</li>
                  <li><strong>σ = {parameters.volatility.toFixed(2)}</strong>: Volatility of the underlying asset (decimal form)</li>
                  <li><strong>N(x)</strong>: Cumulative distribution function of the standard normal distribution</li>
                </ul>
              </div>
              
              <div className="formula-section">
                <h4>Terms Explained:</h4>
                <ul className="terms-explanation">
                  <li><strong>N(d₁)</strong>: Represents the delta of the call option, which is the sensitivity of the option price to changes in the underlying price</li>
                  <li><strong>N(d₂)</strong>: Represents the probability that the option will be exercised at maturity (in a risk-neutral world)</li>
                  <li><strong>S × N(d₁)</strong>: The expected value of receiving the stock if the option expires in-the-money</li>
                  <li><strong>K × e<sup>-rT</sup> × N(d₂)</strong>: The expected value of paying the strike price if the option expires in-the-money</li>
                  <li><strong>e<sup>-rT</sup></strong>: The present value factor that discounts the strike price from the future to the present</li>
                </ul>
              </div>
              
              <div className="formula-section">
                <h4>Greeks in Terms of the Formula:</h4>
                <ul className="greeks-formula">
                  <li><strong>Delta (Δ)</strong>: N(d₁) for a call option, N(d₁) - 1 for a put option</li>
                  <li><strong>Gamma (Γ)</strong>: N'(d₁) / (S × σ × √T) (same for both call and put)</li>
                  <li><strong>Theta (Θ)</strong>: -[S × N'(d₁) × σ / (2 × √T)] - r × K × e<sup>-rT</sup> × N(d₂) for a call</li>
                  <li><strong>Vega (ν)</strong>: S × √T × N'(d₁) (same for both call and put)</li>
                  <li><strong>Rho (ρ)</strong>: K × T × e<sup>-rT</sup> × N(d₂) for a call, -K × T × e<sup>-rT</sup> × N(-d₂) for a put</li>
                </ul>
                <p><em>Note: N'(x) is the probability density function of the standard normal distribution</em></p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'normal' && (
          <NormalDistribution />
        )}
        
        {activeTab === 'brownian' && (
          <BrownianMotion />
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;
