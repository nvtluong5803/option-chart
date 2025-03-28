import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { calculateGreeks, calculateOptionPrice } from '../utils/BlackScholes';
import './DeltaTangentChart.css';

const DeltaTangentChart = ({ priceChartData, parameters }) => {
  // State for the hover point and tangent line
  const [hoverPoint, setHoverPoint] = useState(null);
  const [tangentLine, setTangentLine] = useState(null);
  const [chartData, setChartData] = useState([]);
  
  // Generate our own data with option price and delta for each point
  useEffect(() => {
    if (!parameters) return;
    
    const { optionType, strikePrice, riskFreeRate, timeToMaturity, volatility } = parameters;
    
    // Generate price points
    const range = strikePrice * 0.8;
    const minPrice = Math.max(1, strikePrice - range);
    const maxPrice = strikePrice + range;
    const step = (maxPrice - minPrice) / 50;
    
    const data = [];
    for (let price = minPrice; price <= maxPrice; price += step) {
      const optionPrice = calculateOptionPrice(
        optionType, 
        price, 
        strikePrice, 
        riskFreeRate, 
        timeToMaturity, 
        volatility
      );
      
      const greeks = calculateGreeks(
        optionType, 
        price, 
        strikePrice, 
        riskFreeRate, 
        timeToMaturity, 
        volatility
      );
      
      data.push({
        underlyingPrice: price,
        optionPrice: optionPrice,
        delta: greeks.delta
      });
    }
    
    setChartData(data);
  }, [parameters]);
  
  // Function to calculate the tangent line at a given point
  const calculateTangentLine = (point) => {
    if (!point || !point.underlyingPrice || point.delta === undefined || point.optionPrice === undefined) {
      return null;
    }
    
    // Delta is the slope of the tangent line
    const slope = point.delta;
    
    // Calculate y-intercept (b) from point-slope form: y - y1 = m(x - x1)
    // Rearranged to y = mx + b, so b = y1 - m*x1
    const intercept = point.optionPrice - slope * point.underlyingPrice;
    
    // Generate two points to draw the tangent line
    // We'll extend the line a bit in both directions
    const range = parameters.strikePrice * 0.8;
    
    const x1 = Math.max(1, point.underlyingPrice - range/2);
    const y1 = slope * x1 + intercept;
    
    const x2 = point.underlyingPrice + range/2;
    const y2 = slope * x2 + intercept;
    
    return [
      { underlyingPrice: x1, tangentY: y1 },
      { underlyingPrice: x2, tangentY: y2 }
    ];
  };
  
  // Handle mouse move on the chart
  const handleMouseMove = (e) => {
    if (e && e.activePayload && e.activePayload.length) {
      const point = e.activePayload[0].payload;
      setHoverPoint(point);
      setTangentLine(calculateTangentLine(point));
    }
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoverPoint(null);
    setTangentLine(null);
  };
  
  // Format for tooltip
  const formatTooltip = (value, name) => {
    if (name === 'optionPrice' && value !== undefined && value !== null) {
      return [`$${value.toFixed(2)}`, 'Option Price'];
    } else if (name === 'tangentY' && value !== undefined && value !== null) {
      return [`$${value.toFixed(2)}`, 'Tangent'];
    } else if (name === 'delta' && value !== undefined && value !== null) {
      return [value.toFixed(4), 'Delta'];
    }
    return [value, name];
  };
  
  const labelFormatter = (value) => {
    return value !== undefined && value !== null 
      ? `Underlying Price: $${value.toFixed(2)}`
      : 'Underlying Price: N/A';
  };
  
  // Early return if we don't have the necessary data
  if (chartData.length === 0 || !parameters) {
    return (
      <div className="delta-tangent-chart">
        <h3>Option Price vs. Underlying Price with Delta Tangent Line</h3>
        <p>Loading chart data...</p>
      </div>
    );
  }
  
  return (
    <div className="delta-tangent-chart">
      <h3>Option Price vs. Underlying Price with Delta Tangent Line</h3>
      
      <div className="chart-description">
        <p>
          This chart shows how the option price changes with the underlying price. 
          The <span className="highlight">tangent line</span> at any point represents the 
          <span className="highlight"> delta</span> of the option at that price.
        </p>
        <p>
          Delta is the rate of change of the option price with respect to changes in the 
          underlying price. It is the <span className="highlight">slope of the tangent line</span> 
          to the option price curve.
        </p>
        <p>
          <strong>Hover over the curve</strong> to see the tangent line and delta value at that point.
        </p>
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
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
              domain={[-30, 'auto']}
            />
            <Legend />
            
            {/* Option price curve */}
            <Line
              data={chartData}
              type="monotone"
              dataKey="optionPrice"
              name="Option Price"
              stroke="#8884d8"
              dot={false}
              activeDot={{ r: 8, fill: "#ff7300" }}
              isAnimationActive={false}
            />
            
            {/* Tangent line */}
            {tangentLine && tangentLine.length === 2 && (
              <Line
                data={tangentLine}
                type="linear"
                dataKey="tangentY"
                name="Delta Tangent"
                stroke="#ff7300"
                strokeWidth={2}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            )}

            {/* Horizontal reference line through current point */}
            {hoverPoint && (
              <ReferenceLine
                y={hoverPoint.optionPrice}
                stroke="#82ca9d"
                strokeDasharray="3 3"
                label={{
                  value: `$${hoverPoint.optionPrice.toFixed(2)}`,
                  position: 'right'
                }}
              />
            )}
            
            {/* Strike price reference line */}
            {parameters && parameters.strikePrice && (
              <ReferenceLine 
                x={parameters.strikePrice} 
                stroke="green" 
                strokeDasharray="3 3"
                label={{ 
                  value: `Strike: $${parameters.strikePrice.toFixed(2)}`, 
                  position: 'insideTopRight' 
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {hoverPoint && (
        <div className="hover-info">
          <div className="info-item">
            <span className="info-label">Underlying Price:</span>
            <span className="info-value">
              ${hoverPoint.underlyingPrice !== undefined ? hoverPoint.underlyingPrice.toFixed(2) : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Option Price:</span>
            <span className="info-value">
              ${hoverPoint.optionPrice !== undefined ? hoverPoint.optionPrice.toFixed(2) : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Delta:</span>
            <span className="info-value">
              {hoverPoint.delta !== undefined ? hoverPoint.delta.toFixed(4) : 'N/A'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeltaTangentChart;
