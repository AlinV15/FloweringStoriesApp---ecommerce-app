// jest.setup.js (convertit din TS setup-ul tău)
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            refresh: jest.fn(),
        }
    },
    useSearchParams() {
        return new URLSearchParams()
    },
    usePathname() {
        return '/'
    },
}))

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => {
    return function dynamic(func) {
        return func()
    }
})

// Mock environment variables
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
process.env.NODE_ENV = 'test'

// Global test utilities - suppress console logs during tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: jest.fn(),
})

// Cleanup after each test
afterEach(() => {
    jest.clearAllMocks()
})

// Mock window.alert și window.confirm
global.alert = jest.fn()
global.confirm = jest.fn()

// Mock window.location mai complet
delete window.location
window.location = {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
}

// Suprima warning-urile jsdom specifice
const originalError = console.error
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Not implemented: navigation') ||
                args[0].includes('Not implemented: window.alert'))
        ) {
            return
        }
        originalError.call(console, ...args)
    }
})

afterAll(() => {
    console.error = originalError
})