import { TextEncoder as TE, TextDecoder as TD } from 'util';

// Mock environment variables for tests
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.ALCHEMY_API_KEY = 'test-alchemy-key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';

import '@testing-library/jest-dom';

// Global mocks
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
};

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    };
  },
  useParams() {
    return {};
  },
}));

// Provide basic matchMedia if window exists
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock globals for Node environment (often stripped by Jest)
if (typeof Request === 'undefined') {
  // @ts-expect-error: mocking global Request
  global.Request = class Request {};
}
if (typeof Response === 'undefined') {
  // @ts-expect-error: mocking global Response
  global.Response = class Response {};
}
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = TE as unknown as typeof TextEncoder;
  global.TextDecoder = TD as unknown as typeof TextDecoder;
}
