import manifest from './manifest';

describe('manifest', () => {
  it('returns a valid web app manifest', () => {
    const result = manifest();
    expect(result.name).toBe('LexExhibit');
    expect(result.short_name).toBe('LexExhibit');
    expect(result.display).toBe('standalone');
    expect(result.background_color).toBe('#09090b');
    expect(result.theme_color).toBe('#f59e0b');
    expect(result.start_url).toBe('/');
  });

  it('includes both icon sizes', () => {
    const result = manifest();
    expect(result.icons).toHaveLength(2);
    expect(result.icons).toEqual([
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ]);
  });
});
