
interface OneWireDescription {
    path: string;
}

interface DbDesription {
    connstring: string;
}

export default interface Config {
    defaultIntervalMs: number
    port: number,
    postgresql: DbDesription;
    oneWire: OneWireDescription;
}
