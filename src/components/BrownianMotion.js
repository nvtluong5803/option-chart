import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import './BrownianMotion.css';

const BrownianMotion = () => {
  // Parameters for Brownian motion
  const [drift, setDrift] = useState(0.05);      // μ (mu): drift coefficient
  const [diffusion, setDiffusion] = useState(0.2); // σ (sigma): diffusion coefficient
  const [timeHorizon, setTimeHorizon] = useState(1); // T: time horizon in years
  const [timeSteps, setTimeSteps] = useState(252); // Number of time steps (252 trading days in a year)
  const [initialValue, setInitialValue] = useState(100); // S₀: initial value
  const [paths, setPaths] = useState(5); // Number of paths to simulate
  
  // State for simulation data
  const [simulationData, setSimulationData] = useState([]);
  const [showExpectedPath, setShowExpectedPath] = useState(true);
  
  // Function to generate a single Brownian motion path
  const generatePath = (drift, diffusion, timeHorizon, timeSteps, initialValue, seed) => {
    const dt = timeHorizon / timeSteps;
    const sqrtDt = Math.sqrt(dt);
    
    const path = [];
    let currentValue = initialValue;
    
    // Add initial point
    path.push({
      time: 0,
      value: currentValue
    });
    
    // Use a simple pseudo-random number generator with seed for reproducibility
    const random = () => {
      // Simple LCG random number generator
      seed = (seed * 9301 + 49297) % 233280;
      const rnd = seed / 233280;
      
      // Box-Muller transform to get normal distribution
      const u1 = rnd;
      const u2 = (seed / 233280 + 0.1) % 1; // Another random number
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      
      return z;
    };
    
    // Generate the path
    for (let t = 1; t <= timeSteps; t++) {
      // Geometric Brownian Motion: dS = μSdt + σSdW
      const time = t * dt;
      const randomComponent = diffusion * currentValue * sqrtDt * random();
      const driftComponent = drift * currentValue * dt;
      
      currentValue = currentValue + driftComponent + randomComponent;
      
      path.push({
        time: time,
        value: currentValue
      });
    }
    
    return path;
  };
  
  // Generate expected path (deterministic part only)
  const generateExpectedPath = (drift, timeHorizon, timeSteps, initialValue) => {
    const dt = timeHorizon / timeSteps;
    const path = [];
    
    for (let t = 0; t <= timeSteps; t++) {
      const time = t * dt;
      // Expected value of GBM: S₀ * e^(μt)
      const value = initialValue * Math.exp(drift * time);
      
      path.push({
        time: time,
        value: value
      });
    }
    
    return path;
  };
  
  // Regenerate simulation when parameters change
  useEffect(() => {
    const simulatePaths = () => {
      const allPaths = [];
      
      // Generate multiple paths
      for (let i = 0; i < paths; i++) {
        const seed = i * 10000 + Date.now() % 10000; // Different seed for each path
        const path = generatePath(drift, diffusion, timeHorizon, timeSteps, initialValue, seed);
        
        // Format data for chart
        const formattedPath = path.map(point => ({
          time: point.time,
          [`path${i + 1}`]: point.value
        }));
        
        allPaths.push(formattedPath);
      }
      
      // Generate expected path
      const expectedPath = generateExpectedPath(drift, timeHorizon, timeSteps, initialValue);
      
      // Merge all paths into a single dataset
      const mergedData = [];
      for (let t = 0; t <= timeSteps; t++) {
        const dataPoint = { time: t * (timeHorizon / timeSteps) };
        
        for (let i = 0; i < paths; i++) {
          dataPoint[`path${i + 1}`] = allPaths[i][t][`path${i + 1}`];
        }
        
        if (showExpectedPath) {
          dataPoint.expected = expectedPath[t].value;
        }
        
        mergedData.push(dataPoint);
      }
      
      setSimulationData(mergedData);
    };
    
    simulatePaths();
  }, [drift, diffusion, timeHorizon, timeSteps, initialValue, paths, showExpectedPath]);
  
  // Generate colors for paths
  const getPathColor = (index, total) => {
    // Color gradient from blue to red
    const hue = 240 - (index / (total - 1)) * 240;
    return `hsl(${hue}, 80%, 50%)`;
  };
  
  return (
    <div className="brownian-motion">
      <h3>Brownian Motion and Geometric Brownian Motion</h3>
      
      <div className="brownian-description">
        <p>
          Brownian motion (also known as Wiener process) is a continuous-time stochastic process 
          that is used to model random behavior over time. In finance, it is the foundation of the 
          Black-Scholes option pricing model and is used to simulate stock price movements.
        </p>
        <p>
          Geometric Brownian Motion (GBM) is a continuous-time stochastic process where the logarithm 
          of the randomly varying quantity follows a Brownian motion with drift. It is commonly used to 
          model stock prices in the Black-Scholes model and in Monte Carlo simulations.
        </p>
      </div>
      
      <div className="controls">
        <div className="control-group">
          <label>Drift (μ): {drift.toFixed(2)}</label>
          <input 
            type="range" 
            min="-0.5" 
            max="0.5" 
            step="0.01" 
            value={drift} 
            onChange={(e) => setDrift(parseFloat(e.target.value))}
          />
          <span className="param-description">Expected return rate</span>
        </div>
        
        <div className="control-group">
          <label>Diffusion (σ): {diffusion.toFixed(2)}</label>
          <input 
            type="range" 
            min="0.01" 
            max="0.5" 
            step="0.01" 
            value={diffusion} 
            onChange={(e) => setDiffusion(parseFloat(e.target.value))}
          />
          <span className="param-description">Volatility of the process</span>
        </div>
        
        <div className="control-group">
          <label>Time Horizon (T): {timeHorizon.toFixed(2)} years</label>
          <input 
            type="range" 
            min="0.1" 
            max="5" 
            step="0.1" 
            value={timeHorizon} 
            onChange={(e) => setTimeHorizon(parseFloat(e.target.value))}
          />
        </div>
        
        <div className="control-group">
          <label>Initial Value (S₀): ${initialValue.toFixed(2)}</label>
          <input 
            type="range" 
            min="10" 
            max="500" 
            step="10" 
            value={initialValue} 
            onChange={(e) => setInitialValue(parseFloat(e.target.value))}
          />
        </div>
        
        <div className="control-group">
          <label>Number of Paths: {paths}</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            step="1" 
            value={paths} 
            onChange={(e) => setPaths(parseInt(e.target.value))}
          />
        </div>
        
        <div className="control-group checkbox">
          <label>
            <input 
              type="checkbox" 
              checked={showExpectedPath} 
              onChange={(e) => setShowExpectedPath(e.target.checked)}
            />
            Show Expected Path
          </label>
        </div>
      </div>
      
      <div className="simulation-chart">
        <h4>Geometric Brownian Motion Simulation</h4>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={simulationData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              domain={[0, timeHorizon]}
              label={{ value: 'Time (years)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              domain={['auto', 'auto']}
              label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value) => [`$${value.toFixed(2)}`, 'Value']}
              labelFormatter={(value) => `Time: ${parseFloat(value).toFixed(2)} years`}
            />
            <Legend />
            
            {/* Render each path */}
            {Array.from({ length: paths }).map((_, i) => (
              <Line
                key={`path-${i + 1}`}
                type="monotone"
                dataKey={`path${i + 1}`}
                name={`Path ${i + 1}`}
                stroke={getPathColor(i, paths)}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))}
            
            {/* Render expected path */}
            {showExpectedPath && (
              <Line
                type="monotone"
                dataKey="expected"
                name="Expected Path"
                stroke="#000"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="brownian-theory">
        <h4>Mathematical Formulation</h4>
        
        <div className="theory-section">
          <h5>Standard Brownian Motion (Wiener Process)</h5>
          <p>
            A standard Brownian motion W(t) is a continuous-time stochastic process that satisfies:
          </p>
          <ul>
            <li>W(0) = 0</li>
            <li>W(t) has independent increments</li>
            <li>W(t) - W(s) ~ N(0, t-s) for 0 ≤ s &lt; t</li>
            <li>W(t) has continuous paths</li>
          </ul>
          <p>
            Where N(0, t-s) denotes the normal distribution with mean 0 and variance t-s.
          </p>
        </div>
        
        <div className="theory-section">
          <h5>Geometric Brownian Motion (GBM)</h5>
          <p>
            A stochastic process S(t) follows a Geometric Brownian Motion if it satisfies the following 
            stochastic differential equation (SDE):
          </p>
          <div className="formula">
            dS(t) = μS(t)dt + σS(t)dW(t)
          </div>
          <p>Where:</p>
          <ul>
            <li>S(t) is the stock price at time t</li>
            <li>μ is the drift coefficient (expected return)</li>
            <li>σ is the diffusion coefficient (volatility)</li>
            <li>W(t) is a standard Brownian motion</li>
            <li>dW(t) represents the random component (Wiener process increment)</li>
          </ul>
        </div>
        
        <div className="theory-section">
          <h5>Closed-Form Solution</h5>
          <p>
            The SDE for GBM has the following closed-form solution:
          </p>
          <div className="formula">
            S(t) = S(0) × exp((μ - σ²/2)t + σW(t))
          </div>
          <p>
            This means that the logarithm of S(t) follows a normal distribution:
          </p>
          <div className="formula">
            ln(S(t)/S(0)) ~ N((μ - σ²/2)t, σ²t)
          </div>
        </div>
        
        <div className="theory-section">
          <h5>Partial Differential Equation (PDE)</h5>
          <p>
            The Black-Scholes PDE, which is derived from Geometric Brownian Motion, is:
          </p>
          <div className="formula">
            ∂V/∂t + (1/2)σ²S²(∂²V/∂S²) + rS(∂V/∂S) - rV = 0
          </div>
          <p>Where:</p>
          <ul>
            <li>V is the option price as a function of stock price S and time t</li>
            <li>r is the risk-free interest rate</li>
            <li>σ is the volatility of the stock</li>
            <li>∂V/∂t is the rate of change of option value with respect to time</li>
            <li>∂V/∂S is the rate of change of option value with respect to stock price (Delta)</li>
            <li>∂²V/∂S² is the second derivative of option value with respect to stock price (Gamma)</li>
          </ul>
        </div>
        
        <div className="theory-section">
          <h5>Monte Carlo Simulation</h5>
          <p>
            In Monte Carlo simulation, we generate multiple random paths of the underlying asset using 
            the GBM model. For a small time step Δt, we can approximate the GBM as:
          </p>
          <div className="formula">
            S(t+Δt) = S(t) × exp((μ - σ²/2)Δt + σ√Δt × Z)
          </div>
          <p>
            Where Z is a standard normal random variable. This is the approach used in the simulation above.
          </p>
        </div>
        
        <div className="theory-section">
          <h5>Connection to Option Pricing</h5>
          <p>
            The Black-Scholes model assumes that stock prices follow a Geometric Brownian Motion. 
            This assumption allows for the derivation of the closed-form solution for European option prices.
          </p>
          <p>
            In Monte Carlo simulation for option pricing, we generate multiple paths of the underlying asset 
            using GBM, calculate the option payoff for each path, and then take the average of these payoffs, 
            discounted to the present value.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrownianMotion;
