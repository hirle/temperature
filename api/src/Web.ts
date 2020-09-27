import express from 'express';
import bodyParser from 'body-parser';
import { Server } from 'http';
import socketIO from 'socket.io';
import Controller from './Controller';
import Config from './Config';
import ciao from '@homebridge/ciao';
import {Temperature} from '@temperature/model';
import {Status} from '@temperature/model';
import {Location} from '@temperature/model';

export default class Web {

  config: Config;
  app: express.Application;
  controller?: Controller;
  server: Server;
  io: socketIO.Server;


  constructor(config: Config) {
    this.app = express()
    this.config = config;
    this.server = new Server(this.app)
    this.io = socketIO(this.server);
  }

  startOn(controller: Controller) {
    this.controller = controller;
    this.app.use('/static', express.static('static'));
    this.app.use(bodyParser.json());

    this.app.all('*', (req, _, next) => {
      console.log(req.method + ' ' + req.url)
      next()
    })

    this.app.get('/', (_, res) => {
      res.redirect('/static/index.html');
    })

    this.setAPIRoutes();

    this.server.listen(this.config.port, () => {
      console.log(`Listening on ${this.server.address()}`)
    });

    this.setSocketIO();
  }

  setAPIRoutes() {

    this.app.get('/api/temperature/latest', (_, res, next) => {
      this.controller!.getCurrentTemperature()
      .then( temperature => {
        res.send(temperature);
      })
      .catch(next);
    });

    this.app.get('/api/temperatures/:location', (req, res, next) => {

      const queryCount = req.query.count;
      const location = new Location(req.params.location);

      this.controller!.getLastTemperatures(location, queryCount ? parseInt(queryCount.toString()) : undefined )
        .then(temperatures => {
          res.status(200).send(temperatures);
        })
        .catch(next);
    });

    this.app.post('/api/recording/start/:location',  (req, res, next) => {

      const location = new Location(req.params.location);

      try {
        this.controller!.startRecordingCycle(location)
        
          // HTTP_STATUS_NO_CONTENT
          res.sendStatus(204);
        }
        catch(err) {
          next(err);
        }
    });

    this.app.post('/api/recording/stop', (_, res, next) => {
      try {

        this.controller!.stopRecodingCycle();

        // HTTP_STATUS_NO_CONTENT
        res.sendStatus(204);
      }
      catch(err) {
        next(err);
      }

    });
  }

  emitCurrentTemperature(temperature: Temperature) {
    this.io.emit('current-temperature', temperature);
  }
  
  emitStatus(status: Status) {
    this.io.emit('status', status);
  }
  
  emitLastTemperatures(temperatures: Temperature[]) {
    this.io.emit('last-temperatures', temperatures);
  }

  setupBonjourAdvertisment() { 
    // create a service defining a web server running on port 3000
    const service = ciao.getResponder().createService({
        name: 'Temperature',
        type: 'http',
        port: this.config.port
    });

    service.advertise().then(() => {
      console.log("Service is published :)");
    });
    

  }

  setSocketIO() {
    this.io.on('connection', socket => {

      if( this.controller ){      socket.send(this.controller.getStatus());}
    });
  }
}
