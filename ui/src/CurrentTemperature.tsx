import React from 'react';
import styled from 'styled-components';
import {Temperature} from '@temperature/model';
import {GetCurrentTemperature} from './api';
import SocketIo from './SocketIo';

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

interface CurrentTemperatureProps {
  socketIo: SocketIo
}

enum Status {
  Loading,
  Running,
  Error
}

interface CurrentTemperatureState {
    status: Status,
    current?: Temperature
}

export default class CurrentTemperature
  extends React.Component<CurrentTemperatureProps, CurrentTemperatureState> {

  constructor(props: CurrentTemperatureProps) {
      super(props);
      this.state = {status: Status.Loading};
    }

  componentDidMount() {
      GetCurrentTemperature()
        .then( temperature => {        
          this.setState({status: Status.Running, current: temperature});

          this.setUpSocketIO();
        })
        .catch( err => {
          console.log(err);
          this.setState({status: Status.Error, current: undefined});
        });
  }

  setUpSocketIO() {
    this.props.socketIo.addObserver('current-temperature', this.onCurrentTemperature);
  }
  onCurrentTemperature( data:any) {
    const current = Temperature.create(data);
    this.setState({current});
  }

  render() {
    switch(this.state.status)  {
      case Status.Loading: return <div>Loading...</div>;
      case Status.Running: return <Measure><BigText>{this.state.current!.value}°C</BigText> {this.state.current!.timestamp.toLocaleString()}</Measure>;
      default: return <Error>Can't get the temperature</Error>;
  }
}  