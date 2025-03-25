# European Option Calculator

A web application for calculating European option prices using the Black-Scholes model. This tool provides option pricing, Greeks calculation, and interactive visualizations.

## Features

- **European Option Pricing**: Calculate option premiums using the Black-Scholes model
- **Greeks Calculation**: View Delta, Gamma, Theta, Vega, and Rho values
- **Interactive Charts**: 
  - Option Price vs. Underlying Price for different volatility levels
  - Delta vs. Volatility for at-the-money options

## Technologies Used

- React
- recharts for data visualization
- mathjs for mathematical functions

## Usage

1. Select option type (Call or Put)
2. Enter parameters:
   - Underlying price
   - Strike price
   - Time to maturity (in years)
   - Volatility (%)
   - Risk-free rate (%)
3. View the calculated option premium and Greeks
4. Explore the interactive charts to understand how option prices and Greeks change with different parameters

## Development

### Prerequisites

- Node.js
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/nvtluong5803/option-chart.git
cd option-chart

# Install dependencies
npm install

# Start the development server
npm start
```

### Deployment

```bash
# Deploy to GitHub Pages
npm run deploy
```

## License

MIT

## Acknowledgments

- Black-Scholes model for option pricing
- React and recharts for making interactive visualizations possible
