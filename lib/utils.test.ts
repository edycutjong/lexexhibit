import { cn, formatCompactCurrency } from './utils';

describe('cn utility', () => {
  it('should join class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
  });

  it('should merge tailwind classes correctly', () => {
    // tailwind-merge should resolve conflicts
    expect(cn('px-2 py-2', 'p-4')).toBe('p-4');
  });

  it('should handle empty or undefined inputs', () => {
    expect(cn('', undefined, null, 'class1')).toBe('class1');
  });
});

describe('formatCompactCurrency utility', () => {
  it('should format small numbers correctly', () => {
    expect(formatCompactCurrency(150)).toBe('$150');
  });

  it('should format thousands correctly', () => {
    expect(formatCompactCurrency(3500)).toBe('$3.5K');
  });

  it('should format millions correctly', () => {
    expect(formatCompactCurrency(1250000)).toBe('$1.3M');
  });

  it('should format billions correctly', () => {
    expect(formatCompactCurrency(4500000000)).toBe('$4.5B');
  });

  it('should handle zero correctly', () => {
    expect(formatCompactCurrency(0)).toBe('$0');
  });

  it('should handle undefined or null correctly', () => {
    expect(formatCompactCurrency(undefined as unknown as number)).toBe('$0');
    expect(formatCompactCurrency(null as unknown as number)).toBe('$0');
  });
});
