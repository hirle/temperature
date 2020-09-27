import React from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import {Temperature} from '@temperature/model';
import {GetCurrentTemperature} from './api';

const BigText = styled.span`
  color: white;
  font-size: 48px;
`;

const Measure = styled.div`
  color: gray;
  padding: 12px 48px;
`;

const Error = styled.div`
    font-size: 18px;
    color: red;
`;

interface CurrentTemperatureState {
    connected: boolean,
    current?: Temperature
}

export default class CurrentTemperature extends React.Component<{}, CurrentTemperatureState> {
    
  private socket?: SocketIOClient.Socket;

  constructor(props: any) {
      super(props);
      this.state = {connected: false};
    }

  componentDidMount() {
      GetCurrentTemperature()
        .then( temperature => {        
          this.setState({connected: true, current: temperature});

          this.setUpSocketIO();
        })
        .catch( err => {
          console.log(err);
          this.setState({connected: false, current: undefined});
        });
  }

  setUpSocketIO() {
    this.socket = io('/');
    this.socket.on('connect', () => { this.setState({connected:true});});
    this.socket.on('current-temperature', (data: any) => {
      const current = Temperature.create(data);
      this.setState({current});
    });
    this.socket.on('disconnect', () => {this.setState({connected:false});;});  
  }

  render() {
    return this.state.connected
      ? <Measure><BigText>{this.state.current!.value}°C</BigText> {this.state.current!.timestamp.toLocaleString()}</Measure>
      : <Error>(Not connected)</Error>
  }


}
  