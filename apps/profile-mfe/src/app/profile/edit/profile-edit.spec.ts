import { splitName, joinName } from './profile-edit';

describe('contact name mapping', () => {
  it('splits full name into first/last', () => {
    expect(splitName('Priit Mikelsaar')).toEqual({ first: 'Priit', last: 'Mikelsaar' });
    expect(splitName('Anna Maria Kask')).toEqual({ first: 'Anna Maria', last: 'Kask' });
    expect(splitName('Madli')).toEqual({ first: 'Madli', last: '' });
  });
  it('joins first/last back', () => {
    expect(joinName('Priit', 'Mikelsaar')).toBe('Priit Mikelsaar');
    expect(joinName('Madli', '')).toBe('Madli');
  });
});
