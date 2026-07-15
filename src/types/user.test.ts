import { UserIdentifierType } from './user';

describe('UserIdentifierType', () => {
  it('maps StellarAddress to stellar_address', () => {
    expect(UserIdentifierType.StellarAddress).toBe('stellar_address');
  });
});
