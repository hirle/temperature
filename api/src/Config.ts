
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
    defaultIntervalMs: number
    port: number,
    bonjourName?: string,
    postgresql: DbDescription;
    oneWire: OneWireDescription;
}
