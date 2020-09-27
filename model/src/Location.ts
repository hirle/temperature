export default class Location {
    location: string;

    constructor( location: string ){
        this.location = location;
    }

    public serialize(): string {
        return this.location;
    }

    static create( data: any) {
        return new Location(data.location);
    }
}

