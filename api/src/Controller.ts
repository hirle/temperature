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
  cycle?: number;

  static readonly defaultNbOfPoints = 6*60;

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

    console.log('db starting')
    this.dbConnector.connect()
      .then(()=> {
        console.log('db started on')

        this.startSimpleCycle();

        this.webConnector.setupBonjourAdvertisment();
      })
      .catch(err  => {
        this.dbConnector.disconnect();
        throw err;
      })


  }

  getCurrentTemperature(): Promise<Temperature> {
    return this.oneWireConnector.readOneTemperature()
      .then( value => new Temperature(value, new Date()));
  }

  getStatus(): Status {
    return  this.cycle ? new Status(true, this.location) : new Status(false, undefined);
  }

  getLastTemperatures(location: Location, nbOfPoints?: number): Promise<Temperature[]> {
    const effectiveNbOfPoints = !nbOfPoints
      ? Controller.defaultNbOfPoints
      : nbOfPoints;
    return this.dbConnector.getLatestTemperatures(location, effectiveNbOfPoints);
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

  stopRecodingCycle(){ 
    if( this.location ) {
      this.startSimpleCycle()
    }
  }

  startSimpleCycle() {
    this.stopAnyCycle();
    this.location = undefined;
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

          this.webConnector.emitCurrentTemperature(new Temperature(temperature, new Date()));
          
          if( this.location ) {
            return this.dbConnector.recordTemperature(new Temperature(temperature, new Date()), this.location)
              .then( () => this.dbConnector.getLatestTemperatures(this.location, Controller.defaultNbOfPoints ) )
              .then( temperatures => {
                this.webConnector.emitLastTemperatures(temperatures);
                return Promise.resolve();
              });
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