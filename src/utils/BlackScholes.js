import { erf } from 'mathjs';

// Cumulative distribution function for standard normal distribution
const cdf = (x) => 0.5 * (1 + erf(x / Math.sqrt(2)));

/**
 * Calculate d1 parameter for Black-Scholes formula
 * @param {number} S - Current stock price
 * @param {number} K - Strike price
 * @param {number} r - Risk-free interest rate (decimal form, e.g., 0.05 for 5%)
 * @param {number} T - Time to maturity (in years)
 * @param {number} sigma - Volatility (decimal form, e.g., 0.2 for 20%)
 * @returns {number} d1 parameter
 */
export const calculateD1 = (S, K, r, T, sigma) => {
  return (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
};

/**
 * Calculate d2 parameter for Black-Scholes formula
 * @param {number} d1 - d1 parameter
 * @param {number} sigma - Volatility (decimal form)
 * @param {number} T - Time to maturity (in years)
 * @returns {number} d2 parameter
 */
export const calculateD2 = (d1, sigma, T) => {
  return d1 - sigma * Math.sqrt(T);
};

/**
 * Calculate option price using Black-Scholes model
 * @param {string} type - Option type ('call' or 'put')
 * @param {number} S - Current stock price
 * @param {number} K - Strike price
 * @param {number} r - Risk-free interest rate (decimal form)
 * @param {number} T - Time to maturity (in years)
 * @param {number} sigma - Volatility (decimal form)
 * @returns {number} Option price
 */
export const calculateOptionPrice = (type, S, K, r, T, sigma) => {
  if (T <= 0) return Math.max(0, type === 'call' ? S - K : K - S);
  
  const d1 = calculateD1(S, K, r, T, sigma);
  const d2 = calculateD2(d1, sigma, T);
  
  if (type === 'call') {
    return S * cdf(d1) - K * Math.exp(-r * T) * cdf(d2);
  } else {
    return K * Math.exp(-r * T) * cdf(-d2) - S * cdf(-d1);
  }
};

/**
 * Calculate option Greeks
 * @param {string} type - Option type ('call' or 'put')
 * @param {number} S - Current stock price
 * @param {number} K - Strike price
 * @param {number} r - Risk-free interest rate (decimal form)
 * @param {number} T - Time to maturity (in years)
 * @param {number} sigma - Volatility (decimal form)
 * @returns {Object} Object containing all Greeks
 */
export const calculateGreeks = (type, S, K, r, T, sigma) => {
  if (T <= 0) {
    const intrinsicValue = Math.max(0, type === 'call' ? S - K : K - S);
    return {
      delta: intrinsicValue > 0 ? (type === 'call' ? 1 : -1) : 0,
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0
    };
  }

  const d1 = calculateD1(S, K, r, T, sigma);
  const d2 = calculateD2(d1, sigma, T);
  
  // Standard normal probability density function
  const pdf = (x) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  
  // Delta
  const delta = type === 'call' 
    ? cdf(d1) 
    : cdf(d1) - 1;
  
  // Gamma (same for calls and puts)
  const gamma = pdf(d1) / (S * sigma * Math.sqrt(T));
  
  // Theta
  const theta = type === 'call'
    ? -S * pdf(d1) * sigma / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * cdf(d2)
    : -S * pdf(d1) * sigma / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * cdf(-d2);
  
  // Vega (same for calls and puts)
  const vega = S * Math.sqrt(T) * pdf(d1) / 100; // Divided by 100 to get change per 1% volatility
  
  // Rho
  const rho = type === 'call'
    ? K * T * Math.exp(-r * T) * cdf(d2) / 100 // Divided by 100 to get change per 1% interest rate
    : -K * T * Math.exp(-r * T) * cdf(-d2) / 100;
  
  return {
    delta,
    gamma,
    theta: theta / 365, // Convert to daily theta
    vega,
    rho
  };
};

/**
 * Generate data for option price vs underlying price chart
 * @param {string} type - Option type ('call' or 'put')
 * @param {number} S - Current stock price
 * @param {number} K - Strike price
 * @param {number} r - Risk-free interest rate (decimal form)
 * @param {number} T - Time to maturity (in years)
 * @param {number} sigma - Volatility (decimal form)
 * @param {number} range - Range percentage around current price (e.g., 0.3 for ±30%)
 * @param {number} points - Number of data points to generate
 * @returns {Array} Array of data points for the chart
 */
export const generatePriceChartData = (type, S, K, r, T, sigma, range = 0.3, points = 50) => {
  const minPrice = S * (1 - range);
  const maxPrice = S * (1 + range);
  const step = (maxPrice - minPrice) / (points - 1);
  
  const data = [];
  for (let price = minPrice; price <= maxPrice; price += step) {
    data.push({
      underlyingPrice: price,
      optionPrice: calculateOptionPrice(type, price, K, r, T, sigma)
    });
  }
  
  return data;
};

/**
 * Generate data for option price vs underlying price chart with varying volatilities
 * @param {string} type - Option type ('call' or 'put')
 * @param {number} S - Current stock price
 * @param {number} K - Strike price
 * @param {number} r - Risk-free interest rate (decimal form)
 * @param {number} T - Time to maturity (in years)
 * @param {number} minVol - Minimum volatility (decimal form)
 * @param {number} maxVol - Maximum volatility (decimal form)
 * @param {number} volStep - Volatility step size (decimal form)
 * @param {number} range - Range percentage around current price
 * @param {number} points - Number of data points to generate
 * @returns {Array} Array of data series for the chart
 */
export const generateVolatilityChartData = (
  type, S, K, r, T, 
  minVol = 0.2, maxVol = 0.9, volStep = 0.1,
  range = 0.8, points = 50
) => {
  // Use strike price as reference for range calculation
  const minPrice = K * (1 - range);
  const maxPrice = K * (1 + range);
  const priceStep = (maxPrice - minPrice) / (points - 1);
  
  const allData = [];
  
  // Generate price points for x-axis
  const prices = [];
  for (let price = minPrice; price <= maxPrice; price += priceStep) {
    prices.push(price);
  }
  
  // Generate series for each volatility
  for (let vol = minVol; vol <= maxVol + 0.0001; vol += volStep) {
    const roundedVol = Math.round(vol * 100) / 100; // Round to 2 decimal places
    const seriesData = prices.map(price => ({
      underlyingPrice: price,
      optionPrice: calculateOptionPrice(type, price, K, r, T, roundedVol),
      volatility: roundedVol
    }));
    
    allData.push({
      volatility: roundedVol,
      data: seriesData
    });
  }
  
  return allData;
};

/**
 * Generate data for delta vs volatility chart when underlying price equals strike price
 * @param {string} type - Option type ('call' or 'put')
 * @param {number} K - Strike price
 * @param {number} r - Risk-free interest rate (decimal form)
 * @param {number} T - Time to maturity (in years)
 * @param {number} minVol - Minimum volatility (decimal form)
 * @param {number} maxVol - Maximum volatility (decimal form)
 * @param {number} volStep - Volatility step size (decimal form)
 * @returns {Array} Array of data points for the chart
 */
export const generateDeltaVolatilityData = (
  type, K, r, T,
  minVol = 0.05, maxVol = 1.0, volStep = 0.01
) => {
  const data = [];
  
  for (let vol = minVol; vol <= maxVol + 0.0001; vol += volStep) {
    const roundedVol = Math.round(vol * 100) / 100; // Round to 2 decimal places
    
    // Calculate Greeks at the money (S = K)
    const greeks = calculateGreeks(type, K, K, r, T, roundedVol);
    
    data.push({
      volatility: roundedVol * 100, // Convert to percentage for x-axis
      delta: greeks.delta,
      gamma: greeks.gamma,
      theta: greeks.theta,
      vega: greeks.vega,
      rho: greeks.rho
    });
  }
  
  return data;
};

/**
 * Generate data for delta vs underlying price chart with varying volatilities
 * @param {string} type - Option type ('call' or 'put')
 * @param {number} S - Current stock price
 * @param {number} K - Strike price
 * @param {number} r - Risk-free interest rate (decimal form)
 * @param {number} T - Time to maturity (in years)
 * @param {number} minVol - Minimum volatility (decimal form)
 * @param {number} maxVol - Maximum volatility (decimal form)
 * @param {number} volStep - Volatility step size (decimal form)
 * @param {number} range - Range percentage around strike price
 * @param {number} points - Number of data points to generate
 * @returns {Array} Array of data series for the chart
 */
export const generateDeltaUnderlyingData = (
  type, S, K, r, T, 
  minVol = 0.1, maxVol = 0.9, volStep = 0.1,
  range = 0.8, points = 50
) => {
  // Use strike price as reference for range calculation
  const minPrice = K * (1 - range);
  const maxPrice = K * (1 + range);
  const priceStep = (maxPrice - minPrice) / (points - 1);
  
  const allData = [];
  
  // Generate price points for x-axis
  const prices = [];
  for (let price = minPrice; price <= maxPrice; price += priceStep) {
    prices.push(price);
  }
  
  // Generate series for each volatility
  for (let vol = minVol; vol <= maxVol + 0.0001; vol += volStep) {
    const roundedVol = Math.round(vol * 100) / 100; // Round to 2 decimal places
    const seriesData = prices.map(price => {
      const greeks = calculateGreeks(type, price, K, r, T, roundedVol);
      return {
        underlyingPrice: price,
        delta: greeks.delta,
        volatility: roundedVol
      };
    });
    
    allData.push({
      volatility: roundedVol,
      data: seriesData
    });
  }
  
  return allData;
};
