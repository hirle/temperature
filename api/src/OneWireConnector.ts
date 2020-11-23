import fs from 'fs';

export default class OneWireConnector {

  private path: string;

  constructor(path: string) {
    this.path = path;
  }

  readOneTemperature(): Promise<number> {
    return new Promise((resolve, reject) => {
      fs.readFile(this.path, 'utf-8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          const [lineOne, lineTwo] = data.split('\n');
          const elts = lineTwo.match(/\st=(\d+)$/);
          if (lineOne.endsWith('YES') && elts) {
            resolve(Number.parseInt(elts[1]) / 1000);
          } else {
            resolve(Number.NaN);
          }
        }
      });
    });
  }

}