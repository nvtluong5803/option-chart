import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  Scatter, ScatterChart, ZAxis, Cell, Rectangle, Polygon
} from 'recharts';
import { calculateOptionPrice } from '../utils/BlackScholes';
import './DeltaApproximationChart.css';

const DeltaApproximationChart = ({ parameters }) => {
  const [chartData, setChartData] = useState([]);
  const [deltaPoints, setDeltaPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [zoomedView, setZoomedView] = useState(false);
  const chartRef = useRef(null);
  
  // The small price shift to use for approximation
  const PRICE_SHIFT = 0.01;
  
  useEffect(() => {
    if (!parameters) return;
    
    const { optionType, underlyingPrice, strikePrice, riskFreeRate, timeToMaturity, volatility } = parameters;
    
    // Generate price points around the current price
    const range = strikePrice * 0.4; // Smaller range to focus on area around current price
    const minPrice = Math.max(1, underlyingPrice - range);
    const maxPrice = underlyingPrice + range;
    const step = (maxPrice - minPrice) / 30;
    
    const data = [];
    const deltaApproxPoints = [];
    
    for (let price = minPrice; price <= maxPrice; price += step) {
      // Calculate option price at the current price
      const optionPrice = calculateOptionPrice(
        optionType, 
        price, 
        strikePrice, 
        riskFreeRate, 
        timeToMaturity, 
        volatility
      );
      
      // Calculate option prices with small shifts for delta approximation
      const optionPriceMinus = calculateOptionPrice(
        optionType, 
        price - PRICE_SHIFT, 
        strikePrice, 
        riskFreeRate, 
        timeToMaturity, 
        volatility
      );
      
      const optionPricePlus = calculateOptionPrice(
        optionType, 
        price + PRICE_SHIFT, 
        strikePrice, 
        riskFreeRate, 
        timeToMaturity, 
        volatility
      );
      
      // Approximate delta using central difference formula
      const approximateDelta = (optionPricePlus - optionPriceMinus) / (2 * PRICE_SHIFT);
      
      data.push({
        underlyingPrice: price,
        optionPrice: optionPrice,
        approximateDelta: approximateDelta
      });
      
      // Select specific points to show the delta approximation visually
      // Use round numbers plus the current price
      if (Math.abs(price - underlyingPrice) < 0.01 || 
          Math.abs(price - (strikePrice * 0.8)) < step || 
          Math.abs(price - strikePrice) < step || 
          Math.abs(price - (strikePrice * 1.2)) < step) {
        
        deltaApproxPoints.push({
          underlyingPrice: price,
          optionPrice: optionPrice,
          approximateDelta: approximateDelta,
          minus: { x: price - PRICE_SHIFT, y: optionPriceMinus },
          plus: { x: price + PRICE_SHIFT, y: optionPricePlus }
        });
      }
    }
    
    setChartData(data);
    setDeltaPoints(deltaApproxPoints);
    
    // Set the current price point as selected by default
    const currentPoint = deltaApproxPoints.find(p => 
      Math.abs(p.underlyingPrice - underlyingPrice) < step
    ) || (deltaApproxPoints.length > 0 ? deltaApproxPoints[0] : null);
    
    setSelectedPoint(currentPoint);
    setZoomedView(false); // Reset zoom when parameters change
    
  }, [parameters]);
  
  const handlePointClick = (point) => {
    setSelectedPoint(point);
    setZoomedView(true); // Enable zoomed view when a point is clicked
  };
  
  // Format for tooltip
  const formatTooltip = (value, name) => {
    if (name === 'optionPrice' && value !== undefined && value !== null) {
      return [`$${value.toFixed(2)}`, 'Option Price'];
    } else if (name === 'approximateDelta' && value !== undefined && value !== null) {
      return [value.toFixed(4), 'Approximate Delta'];
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
      <div className="delta-approximation-chart">
        <h3>Delta Approximation</h3>
        <p>Loading chart data...</p>
      </div>
    );
  }
  
  // For rise over run visualization, we'll use points with a larger distance to make it clearer
  const createRiseOverRunVisual = () => {
    if (!selectedPoint) return null;
    
    const minusPoint = { 
      x: selectedPoint.minus.x, 
      y: selectedPoint.minus.y 
    };
    
    const plusPoint = { 
      x: selectedPoint.plus.x, 
      y: selectedPoint.plus.y 
    };
    
    // Calculate the rise and run
    const rise = plusPoint.y - minusPoint.y;
    const run = plusPoint.x - minusPoint.x;
    
    // For better visualization, we'll create a larger triangle
    // We'll scale up the size but maintain the same slope
    const scale = 60; // Even larger scale for better visibility
    
    // Center the triangle on the selected point
    const baseX = selectedPoint.underlyingPrice;
    const baseY = selectedPoint.optionPrice;
    
    // Calculate points for a large triangle that maintains the same slope
    const triangleData = [
      { x: baseX - (scale * PRICE_SHIFT), y: baseY }, // bottom left
      { x: baseX + (scale * PRICE_SHIFT), y: baseY }, // bottom right
      { x: baseX + (scale * PRICE_SHIFT), y: baseY + (scale * rise) }, // top right
    ];
    
    return (
      <>
        {/* Fill triangle area */}
        <Polygon
          points={[
            { x: triangleData[0].x, y: triangleData[0].y },
            { x: triangleData[1].x, y: triangleData[1].y },
            { x: triangleData[2].x, y: triangleData[2].y }
          ]}
          fill="rgba(255, 51, 0, 0.3)"
          stroke="#FF3300"
          strokeWidth={3}
        />
      
        {/* Horizontal line (run) */}
        <Line
          data={[
            { underlyingPrice: triangleData[0].x, optionPrice: triangleData[0].y },
            { underlyingPrice: triangleData[1].x, optionPrice: triangleData[1].y }
          ]}
          dataKey="optionPrice"
          name="Run Line"
          stroke="#FF3300"
          strokeWidth={3}
          dot={false}
        />
        
        {/* Vertical line (rise) */}
        <Line
          data={[
            { underlyingPrice: triangleData[1].x, optionPrice: triangleData[1].y },
            { underlyingPrice: triangleData[2].x, optionPrice: triangleData[2].y }
          ]}
          dataKey="optionPrice"
          name="Rise Line"
          stroke="#FF3300"
          strokeWidth={3}
          dot={false}
        />
        
        {/* Diagonal line (hypotenuse - showing the slope) */}
        <Line
          data={[
            { underlyingPrice: triangleData[0].x, optionPrice: triangleData[0].y },
            { underlyingPrice: triangleData[2].x, optionPrice: triangleData[2].y }
          ]}
          dataKey="optionPrice"
          name="Slope Line"
          stroke="#FF3300"
          strokeWidth={3}
          strokeDasharray="8 4"
          dot={false}
        />
        
        {/* Labels for rise and run */}
        <Line
          data={[
            { 
              underlyingPrice: (triangleData[0].x + triangleData[1].x) / 2, 
              optionPrice: triangleData[0].y * 0.97  // Slightly below the run line
            }
          ]}
          dataKey="optionPrice"
          name="Run Label"
          stroke="none"
          label={{
            value: `Run: ${(triangleData[1].x - triangleData[0].x).toFixed(2)}`,
            fill: '#FF3300',
            fontSize: 16,
            fontWeight: 'bold',
            position: 'bottom'
          }}
          dot={false}
        />
        
        <Line
          data={[
            { 
              underlyingPrice: triangleData[1].x * 1.01,  // Slightly to the right of the rise line
              optionPrice: (triangleData[1].y + triangleData[2].y) / 2
            }
          ]}
          dataKey="optionPrice"
          name="Rise Label"
          stroke="none"
          label={{
            value: `Rise: ${(triangleData[2].y - triangleData[1].y).toFixed(4)}`,
            fill: '#FF3300',
            fontSize: 16,
            fontWeight: 'bold',
            position: 'right'
          }}
          dot={false}
        />
        
        {/* Label for the slope (delta) */}
        <Line
          data={[
            { 
              underlyingPrice: (triangleData[0].x + triangleData[2].x) / 2, 
              optionPrice: (triangleData[0].y + triangleData[2].y) / 2
            }
          ]}
          dataKey="optionPrice"
          name="Slope Label"
          stroke="none"
          label={{
            value: `Slope (Δ): ${selectedPoint.approximateDelta.toFixed(4)}`,
            fill: '#FF3300',
            fontSize: 16,
            fontWeight: 'bold',
            position: 'center'
          }}
          dot={false}
        />
      </>
    );
  };
  
  // Function to reset zoom
  const handleResetZoom = () => {
    setZoomedView(false);
  };
  
  // Calculate domain for zoomed view
  const getChartDomain = () => {
    if (zoomedView && selectedPoint) {
      // Fixed range of +/- 5 around the selected point
      const xMin = selectedPoint.underlyingPrice - 5;
      const xMax = selectedPoint.underlyingPrice + 5;
      
      // Fixed range for y-axis, with minimum of 0
      const yMin = Math.max(0, selectedPoint.optionPrice - 5);
      const yMax = selectedPoint.optionPrice + 5;
      
      return {
        xDomain: [xMin, xMax],
        yDomain: [yMin, yMax]
      };
    }
    
    // Default domain (full view)
    return {
      xDomain: ['dataMin', 'dataMax'],
      yDomain: ['auto', 'auto']
    };
  };
  
  const domains = getChartDomain();
  
  return (
    <div className="delta-approximation-chart">
      <h3>Delta Approximation</h3>
      
      <div className="chart-description">
        <p>
          This chart demonstrates how delta can be approximated numerically using a small price shift (Δx = {PRICE_SHIFT}). 
          Delta is calculated as: <span className="formula">Δ ≈ [Price(S+Δx) - Price(S-Δx)] / (2·Δx)</span>
        </p>
        <p>
          The <span className="highlight">orange dots</span> on the curve represent points where we've calculated the approximate delta.
          <strong> Click on any dot</strong> to see how delta is approximated at that point with a zoomed-in view.
        </p>
      </div>
      
      {zoomedView && (
        <div className="zoom-controls">
          <button className="reset-zoom-button" onClick={handleResetZoom}>
            Reset Zoom
          </button>
        </div>
      )}
      
      <div className="chart-container" ref={chartRef}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 15, right: 40, left: 20, bottom: 15 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="underlyingPrice" 
              type="number" 
              domain={domains.xDomain}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              label={{ value: 'Underlying Price ($)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              domain={domains.yDomain}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              label={{ value: 'Option Price ($)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={labelFormatter}
            />
            <Legend />
            
            {/* Option price curve */}
            <Line
              type="monotone"
              dataKey="optionPrice"
              name="Option Price"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            
            {/* Rise over run visualization - Properly placed to be visible */}
            {selectedPoint && zoomedView && createRiseOverRunVisual()}
            
            {/* Render delta points manually */}
            {deltaPoints.map((point, index) => {
              const isSelected = selectedPoint && Math.abs(selectedPoint.underlyingPrice - point.underlyingPrice) < 0.01;
              
              // Return different dot styles based on whether this point is selected
              return (
                <Line
                  key={`point-${index}`}
                  data={[point]}
                  dataKey="optionPrice"
                  name={index === 0 ? "Delta Points" : ""}
                  stroke="none"
                  isAnimationActive={false}
                  dot={{
                    r: isSelected && zoomedView ? 4 : 8, // Smaller dot when selected
                    fill: isSelected ? 'rgba(255, 0, 0, 0.3)' : '#ff7300', // Make selected dot more transparent
                    strokeWidth: isSelected ? 1 : 2,
                    stroke: '#ffffff',
                    cursor: 'pointer',
                    onClick: () => handlePointClick(point)
                  }}
                />
              );
            })}
            
            {/* Render approximation points for selected point */}
            {selectedPoint && (
              <>
                <Line
                  data={[{ underlyingPrice: selectedPoint.minus.x, optionPrice: selectedPoint.minus.y }]}
                  dataKey="optionPrice"
                  name="Minus Point"
                  stroke="none"
                  dot={{ r: 6, fill: '#33cc33', strokeWidth: 1, stroke: '#ffffff' }}
                />
                <Line
                  data={[{ underlyingPrice: selectedPoint.plus.x, optionPrice: selectedPoint.plus.y }]}
                  dataKey="optionPrice"
                  name="Plus Point"
                  stroke="none"
                  dot={{ r: 6, fill: '#33cc33', strokeWidth: 1, stroke: '#ffffff' }}
                />
                
                {/* Line connecting the approximation points */}
                <Line
                  data={[
                    { underlyingPrice: selectedPoint.minus.x, optionPrice: selectedPoint.minus.y },
                    { underlyingPrice: selectedPoint.plus.x, optionPrice: selectedPoint.plus.y }
                  ]}
                  dataKey="optionPrice"
                  name="Approximation Line"
                  stroke="#33cc33"
                  strokeWidth={zoomedView ? 1 : 2}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </>
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
            
            {/* Current price reference line */}
            {parameters && parameters.underlyingPrice && (
              <ReferenceLine 
                x={parameters.underlyingPrice} 
                stroke="blue" 
                strokeDasharray="3 3"
                label={{ 
                  value: `Current: $${parameters.underlyingPrice.toFixed(2)}`, 
                  position: 'insideTop' 
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {selectedPoint && (
        <div className="delta-approximation-info">
          <h4>Delta Approximation at Underlying Price: ${selectedPoint.underlyingPrice.toFixed(2)}</h4>
          
          <div className="approximation-calculation">
            <div className="calculation-row">
              <span className="calculation-label">Price at S-Δx:</span>
              <span className="calculation-value">${selectedPoint.minus.y.toFixed(4)}</span>
              <span className="calculation-note">at S = ${selectedPoint.minus.x.toFixed(2)}</span>
            </div>
            <div className="calculation-row">
              <span className="calculation-label">Price at S+Δx:</span>
              <span className="calculation-value">${selectedPoint.plus.y.toFixed(4)}</span>
              <span className="calculation-note">at S = ${selectedPoint.plus.x.toFixed(2)}</span>
            </div>
            <div className="calculation-row">
              <span className="calculation-label">Rise (ΔPrice):</span>
              <span className="calculation-value">${(selectedPoint.plus.y - selectedPoint.minus.y).toFixed(4)}</span>
              <span className="calculation-note">Change in option price</span>
            </div>
            <div className="calculation-row">
              <span className="calculation-label">Run (ΔUnderlying):</span>
              <span className="calculation-value">${(selectedPoint.plus.x - selectedPoint.minus.x).toFixed(2)}</span>
              <span className="calculation-note">Change in underlying price</span>
            </div>
            <div className="calculation-row formula">
              <span className="calculation-label">Approximate Delta:</span>
              <span className="calculation-value">${selectedPoint.approximateDelta.toFixed(4)}</span>
              <span className="calculation-note">= Rise / Run = ${(selectedPoint.plus.y - selectedPoint.minus.y).toFixed(4)} / ${(selectedPoint.plus.x - selectedPoint.minus.x).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="delta-visual-explanation">
            <h4>Delta as Slope: "Rise over Run" Triangle</h4>
            <p>
              Delta represents the slope of the option price curve at a given point. Visually, it's the "rise over run" - 
              the ratio of the vertical side (rise) to the horizontal side (run) of the right triangle formed.
            </p>
            <div className="rise-run-formula">
              <span className="formula">Delta = Rise / Run = ΔOption Price / ΔUnderlying Price</span>
            </div>
            <p>
              On the chart above, the <span className="highlight-orange">orange triangle</span> illustrates this concept:
            </p>
            <ul className="triangle-explanation">
              <li>The <strong>horizontal side</strong> (bottom) represents the "run" or change in underlying price</li>
              <li>The <strong>vertical side</strong> (right) represents the "rise" or change in option price</li>
              <li>The <strong>diagonal side</strong> (hypotenuse) shows the slope, which is the delta</li>
            </ul>
            <p>
              This is the geometric interpretation of the derivative (delta) as the slope of the tangent line to the option price curve.
            </p>
          </div>
          
          <div className="approximation-explanation">
            <p>
              The delta of an option is the rate of change of the option price with respect to the underlying price. 
              This numerical approximation uses the central difference method to estimate the derivative at this point.
            </p>
            <p>
              <strong>Practical Use:</strong> In real trading, when analytics systems are unavailable, traders can 
              estimate delta by observing how much the option price changes when the underlying price moves by a small amount.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeltaApproximationChart;
