import {Temperature} from '@temperature/model';
import {Location} from '@temperature/model';
import { Client } from 'pg';

import { DbDescription } from "./Config";

export default class DbConnector {

    private client: Client;
    private static readonly tableName = 'temperature';

    constructor(config: DbDescription){
        this.client = new Client(config);
    }

    public connect(): Promise<void> {
        return this.client.connect()
            .then(() => this.doesTableExist( DbConnector.tableName ))
            .then( tableExists => tableExists
                    ? Promise.resolve()
                    : this.prepareTable( DbConnector.tableName ) 
            );
    }

    public disconnect(): Promise<void> {
        return this.client.end();
    }

    private doesTableExist( tableName :string ): Promise<boolean> {
        return this.client.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${tableName}');`)
            .then((result) => {
                if( result.rowCount !== 1 || !Array.isArray(result.rows) || result.rows.length != 1 ) {
                    throw new Error('unexpected row result');
                }

                return !!result.rows[0].exists
            });
    }

    private prepareTable( tableName :string ): Promise<void> {
        return this.client.query(`CREATE TABLE IF NOT EXISTS ${tableName} ( id SERIAL, location varchar(64) NOT NULL, value VARCHAR(255) NOT NULL, at TIMESTAMPZ NOT NULL);`)
            .then(() => this.client.query(`CREATE INDEX iLocation ON ${tableName} (location)`))
            .then(() => this.client.query(`CREATE INDEX iAt ON ${tableName} (at)`))
            .then(() => Promise.resolve());
    }

    public recordTemperature(temperature: Temperature, location: Location): Promise<void> {
       return this.client.query(
        `INSERT INTO ${DbConnector.tableName} (location, value, at) VALUES ($1, $2, $3)`,
        [location.serialize(), temperature.value, temperature.timestamp]
        )
       .then( result => {
            if( result.rowCount !== 1) {
                throw new Error('unexpected row count');
            }

            return Promise.resolve();
        });
    }

    public getLatestTemperatures(location: Location, count: number): Promise<Temperature[]>{
        return this.client.query(
            `SELECT value, at FROM ( SELECT value, at FROM ${DbConnector.tableName} WHERE location = $1 ORDER BY at LIMIT $2) as descOrder ORDER BY at`, 
            [location.serialize(), count]
        )
        .then( result => result.rows.map( row => new Temperature(parseFloat(row.value), new Date(row.at))));
    }

    public getLatestLocations(count: number): Promise<Location[]>{
        return this.client.query(
            `SELECT location, max(at) as maxAt FROM ${DbConnector.tableName} GROUP BY location ORDER BY max(at) DESC LIMIT $1`,
            [count]
        )
        .then( result => result.rows.map( row => new Location(row.location)));
    }
}