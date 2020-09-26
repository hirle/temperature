import Web from './Web';
import Config from './Config';
import OneWireConnector from './OneWireConnector';
import DbConnector from './DbConnector';
import {Location} from '@temperature/model';
import {Status} from '@temperature/model';
import {Temperature} from '@temperature/model';

export default class Controller {

  webConnector: Web;
  config: Config;
  dbConnector: DbConnector;
  oneWireConnector: OneWireConnector;
  location?: Location;
  cycle?: NodeJS.Timeout;

  static readonly defaultNbOfPoints: 50;

  constructor(config: Config, webConnector: Web, dbConnector: DbConnector, oneWireConnector: OneWireConnector) {
    this.config = config;
    this.webConnector = webConnector;
    this.dbConnector = dbConnector;
    this.oneWireConnector = oneWireConnector;
  }

  startOn() {
    console.log('web starting')
    this.webConnector.startOn(this);
    console.log('web started on');
    this.startSimpleCycle();
  }

  getCurrentTemperature(): Promise<Temperature> {
    return this.oneWireConnector.readOneTemperature()
      .then( value => new Temperature(value, new Date()));
  }

  getStatus(): Status {
    return  this.cycle ? new Status(true, location) : new Status(false, undefined);
  }

  getLastTemperatures(nbOfPoints?: number): Promise<Temperature[]> {

    const effectiveNbOfPoints = !nbOfPoints
      ? Controller.defaultNbOfPoints
      : nbOfPoints;

    throw new Error('not implemented yet');;
  }

  stopAnyCycle() {
    if (this.cycle) {
      clearInterval(this.cycle);
      this.cycle = undefined;
    }
    this.location = undefined;
  }

  startRecordingCycle(location: Location) {
    this.stopAnyCycle();
    this.location = location;
    this.cycle = setInterval(this.runRecordingCycle.bind(this), this.config.defaultIntervalMs);
  }

  startSimpleCycle() {
    this.stopAnyCycle();
    this.cycle = setInterval(this.runSimpleCycle.bind(this), this.config.defaultIntervalMs);
  }

  runSimpleCycle() {
    this.oneWireConnector.readOneTemperature()
      .then(temperature => {
        this.webConnector.emitCurrentTemperature(new Temperature(temperature, new Date()));
      })
      .catch(err => {
        console.log(err);
      })

  }

  runRecordingCycle() {
    this.oneWireConnector.readOneTemperature()
      .then(temperature => {
        if (!isNaN(temperature)) {
          if( this.location ) {
            return this.dbConnector.recordTemperature(new Temperature(temperature, new Date()), this.location);
          } else {
            return Promise.resolve();
          }
        } else {
          console.log('bad checksum');
          return Promise.resolve();
        }
      })
      .catch(err => {
        console.log(err);
      })
  }
}