import React from 'react';
import styled from 'styled-components';
import {Status as RecordingStatus, Location} from '@temperature/model';
import {SocketMessages} from '@temperature/model';
import {GetCurrentStatus, StartRecording, StopRecording} from './api';
import TapeRecorder from './TapeRecorder'
import SocketIo from './SocketIo';
import { Button} from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';

const StyledTapeRecorder = styled(TapeRecorder)`
    height: 56px;
    margin: 0px 12px 0px 0px;
    fill: white;
`;

const FixedWidthButton = styled(Button)`
    width: 144px;
`

const Title = styled.h2`
    color:white;
`;

const Frame = styled.div`
  color: gray;
`;

const TwoStatesSpan = styled.span<{ bright: boolean }>`
    color: ${ props => props.bright ? 'white': 'gray'};
`

const TwoColumnsP = styled.p`
    display:flex;
    align-items: center;
`

const RedError = styled.div`
    font-size: 18px;
    color: red;
`;

interface ComponentProps {
    socketIo: SocketIo
}
  
enum ComponentStatus {
    Loading,
    Ready,
    Error
}
  
interface ComponentState {
    connected: boolean
    componentStatus: ComponentStatus,
    status?: RecordingStatus,
    modalVisible: boolean
}

export default class RecordControl
  extends React.Component<ComponentProps, ComponentState> {

  private onClickBind = this.onClickButton.bind(this);

  constructor(props: ComponentProps) {
      super(props);
      this.state = {componentStatus: ComponentStatus.Loading, connected: false, modalVisible: false};
    }

    componentDidMount() {
        GetCurrentStatus().then( status => {        
            this.setState({
                componentStatus: ComponentStatus.Ready,
                status,
                connected:this.props.socketIo.isConnected()
            });
  
            this.setUpSocketIO();
        })
        .catch( err => {
            console.log(err);
            this.setState({componentStatus: ComponentStatus.Error});
        });
    }

    onClickButton() {
        if( this.state.status!.recording){
            StopRecording()
                .catch( err => {
                    console.log(err);
                    this.setState({componentStatus: ComponentStatus.Error});
                });
        } else {
            // TODO replace this random value
            const randomLocation = new Location( Math.floor(Math.random()*16777216*16777216).toString(16));
            StartRecording(randomLocation)
                .catch( err => {
                    console.log(err);
                    this.setState({componentStatus: ComponentStatus.Error});
                });
        }
    }


    setUpSocketIO() {
        this.props.socketIo.addObserver(SocketMessages.Connect, this.onConnect.bind(this));
        this.props.socketIo.addObserver(SocketMessages.Status, this.onCurrentStatus.bind(this));
        this.props.socketIo.addObserver(SocketMessages.Disconnect, this.onDisconnect.bind(this));
    }

    onCurrentStatus( data:any) {
        const current = RecordingStatus.create(data);
        this.setState({status: current});
    }

    onConnect() {
        this.setState({connected: true});
    }

    onDisconnect() {
        this.setState({connected: false});
    }

    render() {

        switch(this.state.componentStatus) {
            case ComponentStatus.Loading: return <div>Loading... <LoadingOutlined /></div>;
            case ComponentStatus.Ready: return (
                <Frame>
                    <Title>Recording</Title>
                    <TwoColumnsP>
                        <StyledTapeRecorder running={this.state.status!.recording}/>
                        <FixedWidthButton ghost disabled={!this.state.connected} size="large" onClick={this.onClickBind}>{this.state.status!.recording ? 'Stop' : 'Start…'}</FixedWidthButton>
                        { this.state.status!.recording
                            ? <TwoStatesSpan bright={this.state.connected} >{'Location ' + (this.state.status!.location && this.state.status!.location.serialize())}</TwoStatesSpan>
                            : null
                        }
                    </TwoColumnsP>
                </Frame>);
            default: return <RedError>Error, see console...</RedError>;
        }
    }    
}