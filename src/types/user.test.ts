import { UserIdentifierType } from './user';

describe('UserIdentifierType', () => {
  it('maps StellarAddress to stellar_address', () => {
    expect(UserIdentifierType.StellarAddress).toBe('stellar_address');
  });

  it('maps StellarContract to stellar_contract', () => {
    expect(UserIdentifierType.StellarContract).toBe('stellar_contract');
  });
});
