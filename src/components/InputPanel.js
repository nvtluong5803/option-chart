import React from 'react';
import './InputPanel.css';

const InputPanel = ({ parameters, onParameterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = parseFloat(value);
    
    // Convert percentage inputs to decimal form for calculations
    if (['volatility', 'riskFreeRate'].includes(name)) {
      parsedValue = parsedValue / 100;
    }
    
    onParameterChange(name, parsedValue);
  };

  const handleTypeChange = (e) => {
    onParameterChange('optionType', e.target.value);
  };

  // Convert decimal values to percentage for display
  const displayValue = (name, value) => {
    if (['volatility', 'riskFreeRate'].includes(name)) {
      return (value * 100).toFixed(2);
    }
    return value;
  };

  return (
    <div className="input-panel">
      <h2>European Option Parameters</h2>
      
      <div className="input-group">
        <label htmlFor="optionType">Option Type</label>
        <select 
          id="optionType" 
          name="optionType" 
          value={parameters.optionType}
          onChange={handleTypeChange}
        >
          <option value="call">Call</option>
          <option value="put">Put</option>
        </select>
      </div>
      
      <div className="input-group">
        <label htmlFor="underlyingPrice">Underlying Price ($)</label>
        <input 
          type="number" 
          id="underlyingPrice" 
          name="underlyingPrice" 
          value={parameters.underlyingPrice} 
          onChange={handleChange}
          step="0.01"
          min="0.01"
        />
      </div>
      
      <div className="input-group">
        <label htmlFor="strikePrice">Strike Price ($)</label>
        <input 
          type="number" 
          id="strikePrice" 
          name="strikePrice" 
          value={parameters.strikePrice} 
          onChange={handleChange}
          step="0.01"
          min="0.01"
        />
      </div>
      
      <div className="input-group">
        <label htmlFor="timeToMaturity">Time to Maturity (years)</label>
        <input 
          type="number" 
          id="timeToMaturity" 
          name="timeToMaturity" 
          value={parameters.timeToMaturity} 
          onChange={handleChange}
          step="0.01"
          min="0.01"
          max="10"
        />
      </div>
      
      <div className="input-group">
        <label htmlFor="volatility">Volatility (%)</label>
        <input 
          type="number" 
          id="volatility" 
          name="volatility" 
          value={displayValue('volatility', parameters.volatility)} 
          onChange={handleChange}
          step="0.1"
          min="1"
          max="200"
        />
      </div>
      
      <div className="input-group">
        <label htmlFor="riskFreeRate">Risk-Free Rate (%)</label>
        <input 
          type="number" 
          id="riskFreeRate" 
          name="riskFreeRate" 
          value={displayValue('riskFreeRate', parameters.riskFreeRate)} 
          onChange={handleChange}
          step="0.01"
          min="0"
          max="20"
        />
      </div>
    </div>
  );
};

export default InputPanel;
