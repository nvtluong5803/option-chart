import React, { useState, useEffect } from 'react';
import './App.css';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import { 
  calculateOptionPrice, 
  calculateGreeks, 
  generatePriceChartData,
  generateVolatilityChartData,
  generateDeltaUnderlyingData
} from './utils/BlackScholes';

function App() {
  // Default parameters
  const [parameters, setParameters] = useState({
    optionType: 'call',
    underlyingPrice: 100,
    strikePrice: 100,
    timeToMaturity: 1,
    volatility: 0.2, // 20%
    riskFreeRate: 0.05, // 5%
  });

  // Calculated values
  const [optionPrice, setOptionPrice] = useState(0);
  const [greeks, setGreeks] = useState({
    delta: 0,
    gamma: 0,
    theta: 0,
    vega: 0,
    rho: 0
  });
  const [priceChartData, setPriceChartData] = useState([]);
  const [volatilityChartData, setVolatilityChartData] = useState([]);
  const [deltaUnderlyingData, setDeltaUnderlyingData] = useState([]);

  // Update calculations when parameters change
  useEffect(() => {
    const { optionType, underlyingPrice, strikePrice, timeToMaturity, volatility, riskFreeRate } = parameters;
    
    // Calculate option price
    const price = calculateOptionPrice(
      optionType, 
      underlyingPrice, 
      strikePrice, 
      riskFreeRate, 
      timeToMaturity, 
      volatility
    );
    setOptionPrice(price);
    
    // Calculate Greeks
    const calculatedGreeks = calculateGreeks(
      optionType, 
      underlyingPrice, 
      strikePrice, 
      riskFreeRate, 
      timeToMaturity, 
      volatility
    );
    setGreeks(calculatedGreeks);
    
    // Generate price chart data
    const chartData = generatePriceChartData(
      optionType, 
      underlyingPrice, 
      strikePrice, 
      riskFreeRate, 
      timeToMaturity, 
      volatility
    );
    setPriceChartData(chartData);
    
    // Generate volatility chart data
    const volChartData = generateVolatilityChartData(
      optionType, 
      underlyingPrice, 
      strikePrice, 
      riskFreeRate, 
      timeToMaturity,
      0.2, // Min volatility (20%)
      0.9, // Max volatility (90%)
      0.1, // Step size (10%)
      0.8  // Range: 80% below and above strike price
    );
    setVolatilityChartData(volChartData);
    
    // Generate delta vs underlying price data
    const deltaData = generateDeltaUnderlyingData(
      optionType,
      underlyingPrice,
      strikePrice,
      riskFreeRate,
      timeToMaturity,
      0.1, // Min volatility (10%)
      0.9, // Max volatility (90%)
      0.1, // Step size (10%)
      0.8  // Range: 80% below and above strike price
    );
    setDeltaUnderlyingData(deltaData);
  }, [parameters]);

  // Handle parameter changes
  const handleParameterChange = (name, value) => {
    setParameters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Option Charts</h1>
        <p>Black-Scholes Model</p>
      </header>
      <main className="App-main">
        <div className="App-container">
          <div className="left-panel">
            <InputPanel 
              parameters={parameters} 
              onParameterChange={handleParameterChange} 
            />
          </div>
          <div className="right-panel">
            <ResultsPanel 
              optionPrice={optionPrice}
              greeks={greeks}
              priceChartData={priceChartData}
              volatilityChartData={volatilityChartData}
              deltaUnderlyingData={deltaUnderlyingData}
              parameters={parameters}
            />
          </div>
        </div>
      </main>
      <footer className="App-footer">
        <p> {new Date().getFullYear()} Option Charts</p>
      </footer>
    </div>
  );
}

export default App;
