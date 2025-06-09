# Dashboard

This is a React-based COVID-19 dashboard that visualizes US state-level and national COVID-19 data using interactive D3 charts and maps.

## Dataset

This project uses the [New York Times COVID-19 Data](https://github.com/nytimes/covid-19-data) as its primary data source. The dataset is included in the `public/data/covid-19-data` directory and is updated regularly from the NYTimes repository.

## Implementation Approach

- **Frontend:** Built with React and TypeScript for modular, maintainable UI components.
- **Visualization:** Uses D3.js for rendering interactive bubble charts and a US map.
- **Responsive Design:** All charts and controls are fully responsive and adapt to different screen sizes.
- **Features:**
  - Interactive US map with state highlighting and tooltips
  - Yearly and cumulative bubble charts for cases and deaths
  - Year selection controls with responsive layout
  - Consistent color mapping between map and charts
- **Data Loading:** Data is loaded from local CSV files (from the NYTimes dataset) and processed in the browser.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm run deploy`

Deploys the app to GitHub Pages. This command will:
1. Build the app for production
2. Deploy the built files to the `gh-pages` branch

## Deployment

The app is configured to be deployed to GitHub Pages. The homepage URL is set to `https://arnab.github.io/dashboard` in `package.json`. If you need to change this, update the `homepage` field in `package.json`.

To deploy:
1. Make sure you have committed all your changes
2. Run `npm run deploy`
3. The app will be deployed to the `gh-pages` branch
4. GitHub Pages will automatically build and serve your app

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/). 