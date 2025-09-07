# SMA Crossover Analyzer 📈

This web application provides a tool to backtest and visualize the Simple Moving Average (SMA) Crossover strategy for various financial indices. The project is inspired by an interview with Oliver Baron in "ideas-magazin.de", where an AI-optimized strategy using 190- and 212-day SMAs on the DAX was discussed.

This tool allows users to configure their own SMA periods, select from major world indices, and analyze historical performance and crossover events.



## Features

* **Custom SMA Periods:** Set any two SMA lengths (e.g., 50 vs. 200) to test different strategies.
* **Selectable Indices:** Analyze major indices by using their corresponding ETFs (e.g., DAX, S&P 500, NASDAQ 100).
* **Variable Timeframes:** Choose the historical lookback period in days.
* **Interactive Charting:** Visualizes the closing price, both SMA lines, and bullish/bearish crossover events directly on the chart.
* **Persistent Settings:** Your chosen settings are saved in the browser, so they're remembered on your next visit.

## Technology Stack

This project is built with a modern, full-stack TypeScript approach:

* **Framework:** [Next.js](https://nextjs.org/) (with App Router)
* **Library:** [React](https://reactjs.org/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Charting:** [Chart.js](https://www.chartjs.org/) with `react-chartjs-2`
* **Financial Data API:** [Alpha Vantage](https://www.alphavantage.co/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) (version 18 or later) and npm installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://your-repository-url.com/sma-analyzer.git](https://your-repository-url.com/sma-analyzer.git)
    cd sma-analyzer
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Set up your Environment Variables:**
    This project requires an API key from Alpha Vantage to fetch financial data.

    * Get a free API key at [https://www.alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key).
    * Create a file named `.env.local` in the root of the project.
    * Add your API key to the file like this:
        ```
        ALPHA_VANTAGE_API_KEY=YOUR_API_KEY_HERE
        ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## License

This project is licensed under the BSD 3-Clause License. See the [LICENSE](LICENSE) file for details.