import Web from './Web';
import DbConnector from './DbConnector';
import Controller from './Controller';
import OneWireConnector from './OneWireConnector';
import Config from './Config';
import fs from 'fs'

export function main(argv: string[]): number {

    const config = processArgv(argv);

    const dbConnector = new DbConnector(config);
    const webConnector = new Web(config);
    const oneWireConnector = new OneWireConnector(config.oneWire.path);

    const controller = new Controller(
        config,
        webConnector,
        dbConnector,
        oneWireConnector)

    controller.startOn()

    return 0
}

function processArgv(argv: string[]): Config {
    if (argv.length < 3) {
      throw new Error('missing argument: ./path/to/config.json');
    } else {
      return JSON.parse(fs.readFileSync(argv[2], 'utf8'));
    }
  }