import { main } from './Main';

try {
  main(process.argv);
} catch (err) {
  console.log(err);
  process.exit(-1);
}
