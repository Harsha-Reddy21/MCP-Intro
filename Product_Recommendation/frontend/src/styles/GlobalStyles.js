import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f5f5f5;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  main {
    min-height: calc(100vh - 80px);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .grid {
    display: grid;
    gap: 2rem;
  }

  .grid-2 {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }

  .grid-3 {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .grid-4 {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    font-size: 1.1rem;
    color: #666;
  }

  .error {
    background: #fee;
    color: #c33;
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
    text-align: center;
  }

  .success {
    background: #efe;
    color: #3c3;
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
    text-align: center;
  }
`;

export default GlobalStyles; 