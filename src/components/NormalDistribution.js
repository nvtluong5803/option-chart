import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts';
import * as math from 'mathjs';
import './NormalDistribution.css';

const NormalDistribution = () => {
  const [mean, setMean] = useState(0);
  const [stdDev, setStdDev] = useState(1);
  const [xValue, setXValue] = useState(0);
  const [pdfData, setPdfData] = useState([]);
  const [cdfData, setCdfData] = useState([]);
  const [cdfValue, setCdfValue] = useState(0.5);
  const [pdfValue, setPdfValue] = useState(0.3989);
  
  // Function to calculate PDF value at a point
  const calculatePDF = (x, mean, stdDev) => {
    const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
    return coefficient * Math.exp(exponent);
  };
  
  // Function to calculate CDF value at a point
  const calculateCDF = (x, mean, stdDev) => {
    // Use error function for more accurate CDF calculation
    return 0.5 * (1 + math.erf((x - mean) / (stdDev * Math.sqrt(2))));
  };
  
  // Generate data points for the PDF and CDF curves
  useEffect(() => {
    const generateData = () => {
      const pdfPoints = [];
      const cdfPoints = [];
      
      // Calculate range based on mean and stdDev to show a good portion of the distribution
      const range = 4 * stdDev;
      const min = mean - range;
      const max = mean + range;
      const step = range / 50;
      
      for (let x = min; x <= max; x += step) {
        const roundedX = Math.round(x * 100) / 100;
        const pdfY = calculatePDF(roundedX, mean, stdDev);
        const cdfY = calculateCDF(roundedX, mean, stdDev);
        
        pdfPoints.push({ x: roundedX, y: pdfY });
        cdfPoints.push({ x: roundedX, y: cdfY });
      }
      
      setPdfData(pdfPoints);
      setCdfData(cdfPoints);
      
      // Update the current values for the selected x
      setPdfValue(calculatePDF(xValue, mean, stdDev));
      setCdfValue(calculateCDF(xValue, mean, stdDev));
    };
    
    generateData();
  }, [mean, stdDev, xValue]);
  
  // Handle slider changes
  const handleMeanChange = (e) => {
    setMean(parseFloat(e.target.value));
  };
  
  const handleStdDevChange = (e) => {
    setStdDev(parseFloat(e.target.value));
  };
  
  const handleXValueChange = (e) => {
    setXValue(parseFloat(e.target.value));
  };
  
  // Find the closest data point to the selected x value
  const getClosestPoint = (data, targetX) => {
    return data.reduce((prev, curr) => {
      return Math.abs(curr.x - targetX) < Math.abs(prev.x - targetX) ? curr : prev;
    });
  };
  
  // Get the data for shading the area under the PDF curve up to x
  const getShadedPdfData = () => {
    return pdfData.map(point => ({
      ...point,
      y2: point.x <= xValue ? point.y : 0
    }));
  };
  
  return (
    <div className="normal-distribution">
      <h3>Normal Distribution Explained</h3>
      
      <div className="distribution-description">
        <p>
          The normal distribution (also known as the Gaussian distribution) is a continuous probability 
          distribution that is symmetrical around its mean, showing that data near the mean are more 
          frequent than data far from the mean.
        </p>
        <p>
          In the Black-Scholes model, the normal distribution is used to model the probability distribution 
          of the stock price at expiration, assuming that stock returns follow a log-normal distribution.
        </p>
      </div>
      
      <div className="controls">
        <div className="control-group">
          <label>Mean (μ): {mean.toFixed(2)}</label>
          <input 
            type="range" 
            min="-3" 
            max="3" 
            step="0.1" 
            value={mean} 
            onChange={handleMeanChange}
          />
        </div>
        
        <div className="control-group">
          <label>Standard Deviation (σ): {stdDev.toFixed(2)}</label>
          <input 
            type="range" 
            min="0.1" 
            max="3" 
            step="0.1" 
            value={stdDev} 
            onChange={handleStdDevChange}
          />
        </div>
        
        <div className="control-group">
          <label>X Value: {xValue.toFixed(2)}</label>
          <input 
            type="range" 
            min={mean - 4 * stdDev} 
            max={mean + 4 * stdDev} 
            step="0.1" 
            value={xValue} 
            onChange={handleXValueChange}
          />
        </div>
      </div>
      
      <div className="distribution-values">
        <div className="value-box">
          <h4>Probability Density at x = {xValue.toFixed(2)}</h4>
          <div className="value">{pdfValue.toFixed(4)}</div>
          <p>Height of the PDF curve at x</p>
        </div>
        
        <div className="value-box">
          <h4>Cumulative Probability P(X ≤ {xValue.toFixed(2)})</h4>
          <div className="value">{cdfValue.toFixed(4)}</div>
          <p>Area under the PDF curve up to x</p>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart-wrapper">
          <h4>Probability Density Function (PDF)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={getShadedPdfData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="x" 
                domain={['dataMin', 'dataMax']} 
                label={{ value: 'x', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Density', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => [value.toFixed(4), 'Density']}
                labelFormatter={(value) => `x: ${parseFloat(value).toFixed(2)}`}
              />
              <ReferenceLine x={xValue} stroke="red" strokeDasharray="3 3" />
              <ReferenceLine x={mean} stroke="green" strokeDasharray="3 3" />
              <Area 
                type="monotone" 
                dataKey="y" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.1}
              />
              <Area 
                type="monotone" 
                dataKey="y2" 
                stroke="none" 
                fill="#8884d8" 
                fillOpacity={0.5}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: 'green' }}></span>
              <span>Mean (μ = {mean.toFixed(2)})</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: 'red' }}></span>
              <span>Selected x value (x = {xValue.toFixed(2)})</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#8884d8', opacity: 0.5 }}></span>
              <span>Area under curve up to x: {cdfValue.toFixed(4)}</span>
            </div>
          </div>
        </div>
        
        <div className="chart-wrapper">
          <h4>Cumulative Distribution Function (CDF)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cdfData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="x" 
                domain={['dataMin', 'dataMax']} 
                label={{ value: 'x', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                domain={[0, 1]} 
                label={{ value: 'Probability', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => [value.toFixed(4), 'Probability']}
                labelFormatter={(value) => `x: ${parseFloat(value).toFixed(2)}`}
              />
              <ReferenceLine x={xValue} stroke="red" strokeDasharray="3 3" />
              <ReferenceLine y={cdfValue} stroke="blue" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="y" 
                stroke="#82ca9d" 
                dot={false} 
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: 'red' }}></span>
              <span>Selected x value (x = {xValue.toFixed(2)})</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: 'blue' }}></span>
              <span>Probability P(X ≤ {xValue.toFixed(2)}) = {cdfValue.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="normal-distribution-explanation">
        <h4>Key Concepts in the Normal Distribution</h4>
        
        <div className="concept">
          <h5>Probability Density Function (PDF)</h5>
          <div className="formula">
            f(x) = (1 / (σ√2π)) * e<sup>-(x-μ)²/(2σ²)</sup>
          </div>
          <p>
            The PDF describes the relative likelihood of a random variable taking on a given value. 
            The area under the PDF curve over a range of values gives the probability that the random 
            variable falls within that range.
          </p>
        </div>
        
        <div className="concept">
          <h5>Cumulative Distribution Function (CDF)</h5>
          <div className="formula">
            F(x) = P(X ≤ x) = ∫<sub>-∞</sub><sup>x</sup> f(t) dt
          </div>
          <p>
            The CDF gives the probability that a random variable X takes on a value less than or equal to x. 
            It is the integral of the PDF from negative infinity to x.
          </p>
        </div>
        
        <div className="concept">
          <h5>Standard Normal Distribution</h5>
          <p>
            When μ = 0 and σ = 1, we have the standard normal distribution (Z-distribution). 
            Any normal random variable X can be transformed into a standard normal random variable Z using:
          </p>
          <div className="formula">
            Z = (X - μ) / σ
          </div>
        </div>
        
        <div className="concept">
          <h5>Properties of the Normal Distribution</h5>
          <ul>
            <li>Symmetrical around the mean μ</li>
            <li>Mean, median, and mode are all equal</li>
            <li>68% of the data falls within one standard deviation of the mean</li>
            <li>95% of the data falls within two standard deviations of the mean</li>
            <li>99.7% of the data falls within three standard deviations of the mean</li>
          </ul>
        </div>
        
        <div className="concept">
          <h5>Role in Black-Scholes Option Pricing</h5>
          <p>
            In the Black-Scholes formula, N(d₁) and N(d₂) are the cumulative distribution functions 
            of the standard normal distribution. They represent probabilities in a risk-neutral world:
          </p>
          <ul>
            <li>N(d₁) represents the delta of the call option (sensitivity to underlying price changes)</li>
            <li>N(d₂) represents the probability that the option will be exercised in a risk-neutral world</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NormalDistribution;
