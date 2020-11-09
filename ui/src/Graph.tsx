import React from 'react';
import styled from 'styled-components';
import {Status as RecordingStatus, Temperature} from '@temperature/model';
import {GetCurrentStatus, GetLastTemperatures} from './api';
import SocketIo from './SocketIo';
import { Line } from 'react-chartjs-2';
import moment from 'moment';

const StyledError = styled.div`
  font-size: 18px;
  color: red;
`;


interface GraphProps {
  socketIo: SocketIo
}
  
enum ComponentStatus {
  Loading,
  Ready,
  Error
}
  
interface GraphState {
    connected: boolean
    componentStatus: ComponentStatus,
    status?: RecordingStatus;
    data?: any
}

export default class Graph
  extends React.Component<GraphProps, GraphState> {

  private temperatures?: Temperature[];

  constructor(props: GraphProps) {
    super(props);
    this.state = {componentStatus: ComponentStatus.Loading, connected: false};
  }

  componentDidMount() {
    GetCurrentStatus()
      .then( status => {        
        this.setState({
          componentStatus: ComponentStatus.Ready,
          connected: this.props.socketIo.isConnected(),
          status
        });

        this.setUpSocketIO();

        return status.location;
      })
      .then( location => {
        return location
          ? GetLastTemperatures(location)
            .then( temperatures => {
              this.temperatures = temperatures;
              this.setState({
                data: Graph.prepareLineData(
                  this.props.socketIo.isConnected(),
                  temperatures )
              });
            })
          : Promise.resolve();
      })
      .catch( err => {
        console.log(err);
        this.setState({componentStatus: ComponentStatus.Error, status: undefined});
      });
  }

  setUpSocketIO() {
    this.props.socketIo.addObserver('connect', this.onConnect.bind(this));
    this.props.socketIo.addObserver('status', this.onCurrentStatus.bind(this));
    this.props.socketIo.addObserver('last-temperatures', this.onLastTemperatures.bind(this));
    this.props.socketIo.addObserver('disconnect', this.onDisconnect.bind(this));
  }

  onCurrentStatus( data:any) {
    const current = RecordingStatus.create(data);
    this.setState({status: current});
  }

  onConnect() {
    const data = Graph.prepareLineData(
      true,
      this.temperatures)
    this.setState({connected: true, data });
  }

  onDisconnect() {
    const data = Graph.prepareLineData(
      false,
      this.temperatures)
    this.setState({connected: false, data });
  }

  onLastTemperatures(rawTemperatures:any) {
    if(Array.isArray(rawTemperatures)) {
      this.temperatures = rawTemperatures.map( mayBeTemperature => Temperature.create(mayBeTemperature));
      this.setState({ 
        data: Graph.prepareLineData( this.state.connected, this.temperatures )
      });
    }
  }

  render() {
      switch(this.state.componentStatus)  {
        case ComponentStatus.Loading: return <div>Loading...</div>;
        case ComponentStatus.Ready: return this.renderComponentReady();
        default: return <StyledError>Connection failed...</StyledError>;
      }
  }

  static prepareLineData( connected: boolean, temperatures?: Temperature[] ) {
    if( temperatures ) {
      const graphColor = connected ? 'white' : 'grey';
      return {
        labels: temperatures
          .map( temperature => moment(temperature.timestamp).format('hh:mm')),
        datasets: [ {
          backgroundColor: graphColor,
          borderColor: graphColor,
          data: temperatures.map( temperature => ( {
            x: temperature.timestamp.getTime(),
            y: temperature.value } ) ),
          fill: false,
          lineTension: 0,
          pointBorderColor: graphColor,
          pointBackgroundColor: 'black',
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'black',
          pointHoverBorderColor: graphColor,
          pointHoverBorderWidth: 4,
          pointRadius: 2,
          pointHitRadius: 10
        } ] };
      } else {
      return null;
    }
  }

  renderComponentReady(){
    const axesColor = this.state.connected ? 'white' : 'grey'
    const gridColor = '#404040';
    return this.state.data
    ? <Line data={this.state.data} options={{
      legend: {display:false},
      scales:{ xAxes: [{ ticks: { fontColor: axesColor }, gridLines: {color: gridColor }}],
            yAxes: [{ ticks: { fontColor: axesColor }, gridLines: { color: gridColor }}]}
    }}/>
    : <span>(No data yet...)</span>;
  }
}    