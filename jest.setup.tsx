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

/* eslint-disable @typescript-eslint/no-explicit-any */
// Polyfill Canvas getContext
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawWidget: jest.fn(),
    canvas: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    arc: jest.fn(),
    closePath: jest.fn(),
    createRadialGradient: jest.fn(() => ({
      addColorStop: jest.fn(),
    })),
    createLinearGradient: jest.fn(() => ({
      addColorStop: jest.fn(),
    })),
  })) as any;
}

// Polyfill window and Element methods
if (typeof window !== 'undefined') {
  window.scrollTo = jest.fn();
  window.scroll = jest.fn();
}
if (typeof Element !== 'undefined') {
  Element.prototype.scrollTo = jest.fn();
  Element.prototype.scroll = jest.fn();
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = jest.fn();
  }
}
if (typeof window !== 'undefined') {
  if (!(window as any).HTMLElement.prototype.scrollTo) {
    (window as any).HTMLElement.prototype.scrollTo = jest.fn();
  }
  if (!(window as any).HTMLElement.prototype.scrollIntoView) {
    (window as any).HTMLElement.prototype.scrollIntoView = jest.fn();
  }
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useParams: jest.fn(() => ({})),
}));

// Mock framer-motion to simplify UI testing in JSDOM
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    canvas: ({ children, ...props }: any) => <canvas {...props}>{children}</canvas>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  const original = jest.requireActual('lucide-react');
  const mockIcons = Object.keys(original).reduce((acc: any, key) => {
    acc[key] = (props: any) => <span data-testid={`icon-${key}`} {...props} />;
    return acc;
  }, {});
  return mockIcons;
});
/* eslint-enable @typescript-eslint/no-explicit-any */

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

if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    _headers = new Map<string, string>();
    append(name: string, value: string) { this._headers.set(name.toLowerCase(), value); }
    get(name: string) { return this._headers.get(name.toLowerCase()) || null; }
    has(name: string) { return this._headers.has(name.toLowerCase()); }
    forEach(cb: (v: string, k: string) => void) { this._headers.forEach(cb); }
    getSetCookie() { return []; }
  } as unknown as typeof Headers;
}

if (typeof Response === 'undefined' || !Response.json) {
  global.Response = class Response {
    static json(data: unknown, init?: ResponseInit) {
      const res = new Response(JSON.stringify(data), init);
      Object.defineProperty(res, '_json', { value: data, writable: true });
      return res;
    }
    _body: unknown;
    status: number;
    headers: Headers;
    constructor(body: unknown, init?: ResponseInit) {
      this._body = body;
      this.status = init?.status || 200;
      this.headers = init?.headers instanceof Headers ? init.headers : new Headers();
    }
    async json(this: { _json?: unknown; _body?: unknown }) {
      const data = this._json || this._body;
      if (typeof data === 'string' && data !== '') {
        try {
          return JSON.parse(data);
        } catch {
          return data;
        }
      }
      return data;
    }
  } as unknown as typeof Response;
}

if (typeof Request === 'undefined') {
  global.Request = class Request {
    headers = new Headers();
  } as unknown as typeof Request;
}


if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = TE as unknown as typeof TextEncoder;
  global.TextDecoder = TD as unknown as typeof TextDecoder;
}

// Mock next/server for reliable Response handling in tests
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: (data: unknown, init?: { status?: number; headers?: Record<string, string> }) => {
        return {
          status: init?.status || 200,
          ok: (init?.status || 200) < 400,
          json: async () => data,
          headers: new Headers(init?.headers), // Satisfying type without explicit any
          text: async () => JSON.stringify(data),
        };
      },
    },
  };
});
// Helper for API testing
export function createMockRequest(body: unknown): Request {
  return {
    json: async () => body,
    headers: new Headers({ 'Content-Type': 'application/json' }),
  } as unknown as Request;
}
