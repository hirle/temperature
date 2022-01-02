import { Temperature } from '../src/index';
import { Location } from '../src/index';
import { Status } from '../src/index';

describe('Model', () => {
  it('should export 3 types', () => {
    expect(Location).toBeInstanceOf(Function);
    expect(Status).toBeInstanceOf(Function);
    expect(Temperature).toBeInstanceOf(Function);
  });
});
