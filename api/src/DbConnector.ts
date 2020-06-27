import Temperature from "../model/Temperature";

export default class DbConnector {
    public recordTemperature(temperature: Temperature): Promise<void> {
        throw new Error('not implemented yet');
    }
}