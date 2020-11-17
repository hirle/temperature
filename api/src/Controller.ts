import Web from './Web';
import Config from './Config';
import OneWireConnector from './OneWireConnector';
import DbConnector from './DbConnector';
import {Location} from '@temperature/model';
import {Status} from '@temperature/model';
import {Temperature} from '@temperature/model';


abstract class State {
}

class Stopped extends State{
} 

class StateWCycle extends State {
  
  readonly cycle: number;

  constructor(cycle:number, ) {
    super();
    this.cycle = cycle;
  }

  stopCycle(): Stopped {
    clearInterval(this.cycle);

    return new Stopped();
  }
}

class Idle extends StateWCycle {
  
}

class Recording extends StateWCycle {
  
  readonly location: Location;

  constructor(cycle:number, location:Location ){
    super(cycle);
    this.location = location;
  }

}
 
export default class Controller {

  webConnector: Web;
  config: Config;
  dbConnector: DbConnector;
  oneWireConnector: OneWireConnector;
  state: State;

  static readonly defaultNbOfPoints = 6*60;

  constructor(config: Config, webConnector: Web, dbConnector: DbConnector, oneWireConnector: OneWireConnector) {
    this.config = config;
    this.webConnector = webConnector;
    this.dbConnector = dbConnector;
    this.oneWireConnector = oneWireConnector;
    this.state = new Stopped();
  }

  startOn() {
    console.log('web starting')
    this.webConnector.startOn(this);
    console.log('web started on');

    console.log('db starting')
    this.dbConnector.connect()
      .then(()=> {
        console.log('db started on')

        this.startIdleCycle();

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
    return  this.state instanceof Recording ? new Status(true, this.state.location) : new Status(false);
  }

  getLastTemperatures(location: Location, nbOfPoints?: number): Promise<Temperature[]> {
    const effectiveNbOfPoints = !nbOfPoints
      ? Controller.defaultNbOfPoints
      : nbOfPoints;
    return this.dbConnector.getLatestTemperatures(location, effectiveNbOfPoints);
  }

  getLastLocations(nbOfPoints?: number): Promise<Location[]> {
    const effectiveNbOfPoints = !nbOfPoints
      ? Controller.defaultNbOfPoints
      : nbOfPoints;
    return this.dbConnector.getLatestLocations(effectiveNbOfPoints);
  }


  private stopCycle() {
    if( this.state instanceof StateWCycle ){
      this.state = this.state.stopCycle();
    }
  }

  startRecordingCycle(location: Location) {
    this.stopCycle();
    this.state = new Recording(
      setInterval(this.runRecordingCycle.bind(this, location), this.config.defaultIntervalMs),
      location
    );
    this.webConnector.emitStatus(this.getStatus());
    this.runRecordingCycle(location);
  }

  stopRecordingCycle() {
    this.startIdleCycle();
  }

  private startIdleCycle() {
    this.stopCycle();
    this.state = new Idle( setInterval(this.runSimpleCycle.bind(this), this.config.defaultIntervalMs) );
    this.webConnector.emitStatus(this.getStatus());
  }

  private runSimpleCycle() {
    this.oneWireConnector.readOneTemperature()
      .then(temperature => {
        this.webConnector.emitCurrentTemperature(new Temperature(temperature, new Date()));
      })
      .catch(err => {
        console.log(err);
      })

  }

  private runRecordingCycle(location:Location) {
    this.oneWireConnector.readOneTemperature()
      .then(temperature => {
        if (!isNaN(temperature)) {

          this.webConnector.emitCurrentTemperature(new Temperature(temperature, new Date()));
           
          return this.dbConnector.recordTemperature(new Temperature(temperature, new Date()), location)
            .then( () => this.dbConnector.getLatestTemperatures(location, Controller.defaultNbOfPoints ) )
            .then( temperatures => {
              this.webConnector.emitLastTemperatures(temperatures);
              return Promise.resolve();
            });
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