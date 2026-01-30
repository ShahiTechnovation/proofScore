import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.NEXT_PUBLIC_ALEO_RPC = 'https://api.explorer.aleo.org/v1';
process.env.NEXT_PUBLIC_CONTRACT_ADDRESS = 'credit_score.aleo';
process.env.NEXT_PUBLIC_CHAIN_ID = 'testnet';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    takeRecords() {
        return [];
    }
    unobserve() { }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
} as any;
