export default class Temperature {
    value: number;
    timestamp: Date;

    constructor( value: number, timestamp: Date ){
        this.value = value;
        this.timestamp = timestamp;
    }

}