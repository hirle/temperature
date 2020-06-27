import Web from './Web';
import Config from './Config';
import OneWireConnector from './OneWireConnector';
import DbConnector from './DbConnector';
import Temperature from '@model/Temperature';

export default class Controller {

  webConnector: Web;
  config: Config;
  dbConnector: DbConnector;
  oneWireConnector: OneWireConnector;
  location?: string;
  cycle?: NodeJS.Timeout;

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

  getLatestTemperature(): Promise<Temperature> {
    throw new Error('not implemented yet');
  }

  getLastTemperatures(nbOfPoints: number): Promise<Temperature[]> {
    throw new Error('not implemented yet');;
  }

  stopAnyCycle() {
    if (this.cycle) {
      clearInterval(this.cycle);
      this.cycle = undefined;
    }
    this.location = undefined;
  }

  startRecordingCycle(location: string) {
    this.stopAnyCycle();
    this.location = location;
    this.cycle = setInterval(this.runRecordingCycle, this.config.defaultInterval);
  }

  startSimpleCycle() {
    this.stopAnyCycle();
    this.cycle = setInterval(this.runSimpleCycle, this.config.defaultInterval);
  }

  runSimpleCycle() {
    this.oneWireConnector.readOneTemperature()
    .then( temperature  =>{
      this.webConnector();
    })
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