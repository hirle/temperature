import React from 'react';
import styled from 'styled-components'
import CurrentTemperature from './CurrentTemperature'

const StyledApp = styled.div`
  background-color: #282c34;
  color: white;
  height: 100vh;

  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const StyledHeader = styled.header`
  text-align: center;
  font-size: 36px;

`;

function App() {
  return (
    <StyledApp>
      <StyledHeader className="App-header">
        Temperature
      </StyledHeader>
      <section>
        <CurrentTemperature/>
      </section>
    </StyledApp>
  );
}

export default App;
