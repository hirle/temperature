
interface OneWireDescription {
    path: string;
}

interface DbDesription {
    connstring: string;
}

export default interface Config {
    defaultInterval: number
    port: number,
    postgresql: DbDesription;
    gpio: OneWireDescription;
}
