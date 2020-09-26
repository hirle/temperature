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
    throw new Error('not implemented yet');
  }

  getStatus(): Promise<Status.default> {
    const returned = new Status.default(!!this.cycle, this.location);
    return Promise.resolve(returned);
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
    this.location = new Location(location);
    this.cycle = setInterval(this.runRecordingCycle, this.config.defaultInterval);
  }

  startSimpleCycle() {
    this.stopAnyCycle();
    this.cycle = setInterval(this.runSimpleCycle, this.config.defaultInterval);
  }

  runSimpleCycle() {
    this.oneWireConnector.readOneTemperature()
      .then(temperature => this.webConnector.emitCurrentTemperature(temperature))
      .catch(err => {
        console.log(err);
      })

  }

  runRecordingCycle() {
    this.oneWireConnector.readOneTemperature()
      .then(temperature => {
        if (!isNaN(temperature)) {
          const theTemperature = Temperature.create(temperature, location);
          return this.dbConnector.recordTemperature(theTemperature)
        } else {
          console.log('bad checksum');
          return;
        }
      })
      .catch(err => {
        console.log(err);
      })
  }
}