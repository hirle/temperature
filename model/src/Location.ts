export default class Location {
    location: string;

    constructor( location: string ){
        this.location = location;
    }

    public toString() {
        return this.location;
    }

    static create( data: any) {
        return new Location(data.location);
    }
}

