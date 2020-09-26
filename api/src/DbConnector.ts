import {Temperature} from "model";
import Config from "./Config";

export default class DbConnector {

    config: Config;

    constructor(config: Config){
        this.config = config;
    }

    public recordTemperature(temperature: Temperature): Promise<void> {
        throw new Error('not implemented yet');
    }

    public getLatestTemperatures(count: number): Promise<Temperature[]>{
        throw new Error('not implemented yet');
    }
}