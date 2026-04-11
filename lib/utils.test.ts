import { cn } from './utils';

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
