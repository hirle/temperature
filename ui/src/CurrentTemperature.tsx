import React from 'react';
import styled from 'styled-components'
import {Temperature} from '@temperature/model';
import {GetCurrentTemperature} from './api';

const BigText = styled.span`
    color: gray;
    font-size: 36px;
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
    
    constructor(props: any) {
        super(props);

        this.state = {connected: false};
      }

    componentDidMount() {
        GetCurrentTemperature()
          .then( temperature => {
            this.setState({connected: true, current: temperature})
          })
          .catch( err => {
            console.log(err);
            this.setState({connected: false, current: undefined});
          });
    }

    render() {
      return this.state.connected
        ? <div><BigText>{this.state.current!.value}°C</BigText> at {this.state.current!.timestamp.toLocaleString()}</div>
        : <Error>(Not connected)</Error>
    }
  }
  