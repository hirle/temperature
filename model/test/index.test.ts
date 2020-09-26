import { Temperature } from '../src/index';
import { Location } from '../src/index';
import { Status } from '../src/index';

describe('Model', () => {
  it('should export 3 types', () => {
    console.log
    expect(.location).toBeInstanceOf(Function);
    expect(Status).toBeInstanceOf(Function);
    expect(Temperature).toBeInstanceOf(Function);
  });
});
