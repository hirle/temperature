import { Temperature } from '../src/index';
import { Location } from '../src/index';
import { Status } from '../src/index';

describe('Model', () => {
  it('should export 3 types', () => {
    console.log(Temperature)
    expect(Location.default).toBeInstanceOf(Function);
    expect(Status.default).toBeInstanceOf(Function);
    expect(Temperature.default).toBeInstanceOf(Function);
  });
});
