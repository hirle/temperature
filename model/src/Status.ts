import Location from './Location';

export default class Status {
    recording: boolean;
    location?: Location;

    constructor( recording: boolean, location?: Location ){
        this.recording = recording;
        this.location = location;
    }

    static create(data: any): Status {
        const eventualLocation = data.location ? Location.create( data.location) : undefined; 
        return new Status( data.recording, eventualLocation)
    }

}