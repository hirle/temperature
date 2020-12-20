import React from 'react';
import styled from 'styled-components';
import CurrentTemperature from './CurrentTemperature';
import RecordControl from './RecordControl';
import Graph from './Graph';
import SocketIo from './SocketIo';

const StyledApp = styled.div`
  color: white;
  height: 100%;

  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const StyledHeader = styled.header`
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: center;
  font-size: 36px;

`;

const TwoColumns = styled.section`
  display:flex;
	justify-content: center;
`;

const Frame = styled.article`
  padding: 12px 12px;
  margin: 2px;
  border: solid thin gray;
	flex: 1;
`;

export default class App extends React.Component {

  private socketIo: SocketIo;

  constructor(props: any ) {
    super(props);
    this.socketIo = new SocketIo();
  }

  componentDidMount() {
    this.socketIo.startOn('/');
  }


  componentWillUnmount() {
    this.socketIo.stop();
  }

  render() { return (
    <StyledApp>
      <StyledHeader className="App-header">
        Temperature
      </StyledHeader>
      <TwoColumns>
        <Frame>
          <CurrentTemperature socketIo={this.socketIo}/>
        </Frame>
        <Frame>
          <RecordControl socketIo={this.socketIo}/>
        </Frame>
      </TwoColumns>
      <Frame>
        <Graph socketIo={this.socketIo}/>
      </Frame>
    </StyledApp>
  );
 }
}