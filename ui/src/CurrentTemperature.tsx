import React from 'react';
import styled from 'styled-components';
import {Temperature} from '@temperature/model';
import {GetCurrentTemperature} from './api';
import SocketIo from './SocketIo';

const BigText = styled.span<{ bright: boolean }>`
  color: ${ props => props.bright ? 'white': 'gray'};
  font-size: 48px;
`;

const Frame = styled.div`
  color: gray;
`;

const StyledError = styled.div`
    font-size: 18px;
    color: red;
`;

interface CurrentTemperatureProps {
  socketIo: SocketIo
}

enum Status {
  Loading,
  Running,
  Error
}

interface CurrentTemperatureState {
    connected: boolean
    status: Status,
    current?: Temperature
}

export default class CurrentTemperature
  extends React.Component<CurrentTemperatureProps, CurrentTemperatureState> {

  constructor(props: CurrentTemperatureProps) {
      super(props);
      this.state = {status: Status.Loading, connected: false};
    }

  componentDidMount() {
      GetCurrentTemperature()
        .then( temperature => {        
          this.setState({
            status: Status.Running,
            current: temperature,
            connected:this.props.socketIo.isConnected()
          });

          this.setUpSocketIO();
        })
        .catch( err => {
          console.log(err);
          this.setState({status: Status.Error, current: undefined});
        });
  }

  setUpSocketIO() {
    this.props.socketIo.addObserver('connect', this.onConnect.bind(this));
    this.props.socketIo.addObserver('current-temperature', this.onCurrentTemperature.bind(this));
    this.props.socketIo.addObserver('disconnect', this.onDisconnect.bind(this));
  }

  onCurrentTemperature( data:any ) {
    const current = Temperature.create(data);
    this.setState({current});
  }

  onConnect() {
    this.setState({connected: true});
  }

  onDisconnect() {
    this.setState({connected: false});
  }

  render() {
    switch(this.state.status)  {
      case Status.Loading: return <div>Loading...</div>;
      case Status.Running: return (
        <Frame>
          <BigText bright={this.state.connected}>{this.state.current!.value}°C</BigText> {this.state.current!.timestamp.toLocaleString()}
        </Frame>);
      default: return <StyledError>Can't get the temperature</StyledError>;
    }
  }
}  