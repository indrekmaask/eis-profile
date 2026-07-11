import { describe, expect, it } from 'vitest';
import { derivePersonInfo } from './person-code';

describe('derivePersonInfo', () => {
  it('derives a 20th-century male birth date', () => {
    // 3=1900s male, 75-10-09
    const info = derivePersonInfo('37510090251');
    expect(info).not.toBeNull();
    expect(info!.birthDate).toBe('1975-10-09');
    expect(info!.birthDateDisplay).toBe('09.10.1975');
    expect(info!.sex).toBe('M');
  });

  it('derives a 21st-century female birth date', () => {
    // 6=2000s female, 04-02-15
    const info = derivePersonInfo('60402150001');
    expect(info!.birthDate).toBe('2004-02-15');
    expect(info!.sex).toBe('F');
  });

  it('rejects wrong length', () => {
    expect(derivePersonInfo('123')).toBeNull();
    expect(derivePersonInfo('375100902510')).toBeNull();
  });

  it('rejects non-digits', () => {
    expect(derivePersonInfo('3751009025X')).toBeNull();
  });

  it('rejects an impossible calendar date', () => {
    // month 13
    expect(derivePersonInfo('37513090251')).toBeNull();
    // 31 February
    expect(derivePersonInfo('37502310251')).toBeNull();
  });

  it('rejects null / empty', () => {
    expect(derivePersonInfo(null)).toBeNull();
    expect(derivePersonInfo('')).toBeNull();
  });
});
