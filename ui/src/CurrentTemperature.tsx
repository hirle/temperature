import React from 'react';
import styled from 'styled-components';
import {Temperature} from '@temperature/model';
import {SocketMessages} from '@temperature/model';
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

enum ComponentStatus {
  Loading,
  Ready,
  Error
}

interface CurrentTemperatureState {
    connected: boolean
    status: ComponentStatus,
    current?: Temperature
}

export default class CurrentTemperature
  extends React.Component<CurrentTemperatureProps, CurrentTemperatureState> {

  constructor(props: CurrentTemperatureProps) {
      super(props);
      this.state = {status: ComponentStatus.Loading, connected: false};
    }

  componentDidMount() {
      GetCurrentTemperature()
        .then( temperature => {        
          this.setState({
            status: ComponentStatus.Ready,
            current: temperature,
            connected:this.props.socketIo.isConnected()
          });

          this.setUpSocketIO();
        })
        .catch( err => {
          console.log(err);
          this.setState({status: ComponentStatus.Error, current: undefined});
        });
  }

  setUpSocketIO() {
    this.props.socketIo.addObserver(SocketMessages.Connect, this.onConnect.bind(this));
    this.props.socketIo.addObserver(SocketMessages.CurrentTemperature, this.onCurrentTemperature.bind(this));
    this.props.socketIo.addObserver(SocketMessages.Disconnect, this.onDisconnect.bind(this));
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
      case ComponentStatus.Loading: return <div>Loading...</div>;
      case ComponentStatus.Ready: return (
        <Frame>
          <BigText bright={this.state.connected}>{this.state.current!.value}°C</BigText> {this.state.current!.timestamp.toLocaleString()}
        </Frame>);
      default: return <StyledError>Can't get the temperature</StyledError>;
    }
  }
}  