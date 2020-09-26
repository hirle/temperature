import express from 'express';
import expressJson from 'express-json';
import { Server } from 'http';
import socketIO from 'socket.io';
import Controller from './Controller';
import Config from './Config';
import bonjour from 'bonjour';
import {Temperature} from 'model';

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
    this.controller = controller
    this.app.use('/static', express.static('static'))
    this.app.use(expressJson())

    this.app.all('*', (req, res, next) => {
      console.log(req.method + ' ' + req.url)
      next()
    })

    this.app.get('/', (req, res) => {
      res.redirect('/static/index.html');
    })

    this.setAPIRoutes();

    this.setupBonjourAdvertisment();

    this.server.listen(this.config.port, () => {
      console.log('Listening on %s', this.server.address().toString())
    });

    this.setSocketIO();
  }

  setAPIRoutes() {

    this.app.get('/api/temperature/latest', (req, res) => {
      res.send(this.controller!.getCurrentTemperature());
    });

    this.app.get('/api/temperatures', (req, res, next) => {

      this.controller!
        .getLastTemperatures(parseInt(req.query.count))
        .then(temperatures => {
          // HTTP_STATUS_NO_CONTENT
          res.sendStatus(204);
        })
        .catch(next);
    });

    this.app.post('/api/',  (req, res, next) => {

      // TODO decode 
      const location = new Location('TODO');

      this.controller!.startRecordingCycle(location)
        .then( () => {
          // HTTP_STATUS_NO_CONTENT
          res.sendStatus(204);
        })
        .catch(next);
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
    bonjour.publish({ name: 'Temperature', type: 'http', port: this.config.port });
  }

  setSocketIO() {
    this.io.on('connection', socket => {
      socket.send(this.controller.getStatus());
    });
  }
}
