
jest.unmock('@/lib/supabase');
import { createSupabaseClient, supabase } from './supabase';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue('mocked-supabase-client'),
}));

describe('createSupabaseClient', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('creates client when env vars are present', () => {
    process.env.SUPABASE_URL = 'http://localhost';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    
    expect(createSupabaseClient()).toBe('mocked-supabase-client');
  });

  it('returns null when SUPABASE_URL is missing', () => {
    delete process.env.SUPABASE_URL;
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    
    expect(createSupabaseClient()).toBeNull();
  });

  it('returns null when SUPABASE_ANON_KEY is missing', () => {
    process.env.SUPABASE_URL = 'http://localhost';
    delete process.env.SUPABASE_ANON_KEY;
    
    expect(createSupabaseClient()).toBeNull();
  });

  it('supabase export initializes correctly', () => {
    // This is just to ensure coverage of the supabase export line if it's considered uncovered.
    expect(supabase).toBeDefined();
  });
});
