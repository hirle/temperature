import React from 'react';
import { Location} from '@temperature/model';
import {GetLastLocations} from './api';
import { Modal, AutoComplete} from 'antd';
import 'antd/dist/antd.css';

interface ComponentProps {
    ok: (value:Location)=> void,
    cancel: () => void
    error: (err: any) => void
}

interface OptionData {
    value: any,
    label?: string
}
  
interface ComponentState {
    options: OptionData[];
    value: string;
}

export default class ChooseLocationModal
  extends React.Component<ComponentProps, ComponentState> {

    constructor(props: ComponentProps) {
        super(props)
        this.state = {options:[], value: ''};
    }

    componentDidMount() {
        GetLastLocations()
            .then( locations => {
                this.setState( { 
                    options: locations.map(location => ({value: location.toString()}))
                });
            })
            .catch( err => {
                console.log(err);
                this.props.error(err);
            });
    }

    handleOk = () => {
        const location = new Location( this.state.value);
        this.props.ok(location);
    };

    onSelectOrChange = (value: any) => {
        this.setState({value});
    };


    render() {
        return (
            <Modal
                visible
                title="Choose location"
                onOk={this.handleOk}
                onCancel={this.props.cancel}
                okText="Start recording"
            >
                <AutoComplete
                    options={this.state.options}
                    style={{ width: 400 }}
                    onSelect={this.onSelectOrChange}
                    onChange={this.onSelectOrChange}
                    filterOption={(inputValue, option) => !!option && ( option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1)}
                    value={this.state.value}
                    allowClear                
                    placeholder="input here"
                />   
            </Modal>);

    }
}

