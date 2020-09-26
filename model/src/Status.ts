export default class Status {
    recording: boolean;
    location?: Location;

    constructor( recording: boolean, location?: Location ){
        this.recording = recording;
        this.location = location;
    }

}