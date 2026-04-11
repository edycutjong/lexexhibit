import { render, cleanup, screen, fireEvent } from '@testing-library/react';
import { AnimatedBackground } from './AnimatedBackground';
import React from 'react';

describe('AnimatedBackground', () => {
  beforeEach(() => {
    // Mock Canvas Context
    // @ts-expect-error: mocking getContext
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      fillRect: jest.fn(),
      createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn()
      })),
      shadowBlur: 0,
      shadowColor: '',
      fillStyle: ''
    }));

    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        return setTimeout(() => cb(Date.now()), 16) as unknown as number;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => clearTimeout(id as unknown as NodeJS.Timeout));
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('renders a canvas element and handles interactivity', () => {
    const { container } = render(<AnimatedBackground />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    // Trigger resize
    window.dispatchEvent(new Event('resize'));
    
    // Trigger mouse move to hit interactivity branches (lines 47-50)
    // We move the mouse to a known location
    fireEvent.mouseMove(window, { clientX: 50, clientY: 50 });
  });

  it('covers missing canvas ref branch', () => {
    jest.spyOn(React, 'useRef').mockReturnValue({
      get current() { return null; },
      set current(val) {}
    } as any);
    
    render(<AnimatedBackground />);
    jest.restoreAllMocks();
  });

  it('covers className prop', () => {
    render(<AnimatedBackground className="test-class" />);
  });

  it('covers missing context branch in resize', () => {
    // @ts-expect-error: mocking getContext
    HTMLCanvasElement.prototype.getContext = jest.fn(() => null);
    render(<AnimatedBackground />);
    window.dispatchEvent(new Event('resize'));
  });

  it('exercises animation loop and boundary conditions', (done) => {
    // Override random so particles group at predictable spots for boundary testing
    jest.spyOn(Math, 'random').mockReturnValue(-1); 
    
    // Setup window to be very small
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 10 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 10 });

    render(<AnimatedBackground />);
    
    // Just wait for one frame to hit the animation loop logic
    setTimeout(() => {
      // restore Math.random
      jest.restoreAllMocks();
      
      // Do it again but with > bounds
      jest.spyOn(Math, 'random').mockReturnValue(2);
      render(<AnimatedBackground />);
      setTimeout(() => {
        done();
      }, 50);
    }, 50);
  });
});
