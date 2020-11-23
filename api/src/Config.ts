
export interface OneWireDescription {
    path: string;
}

export interface DbDescription {
    user: string,
    password: string,
    host: string,
    port: number,
    database: string
}

export default interface Config {
    period: string
    port: number,
    bonjourName?: string,
    postgresql: DbDescription;
    oneWire: OneWireDescription;
}
