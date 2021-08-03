// Mocks 'ioredis' module with the 'ioredis-mock'.
jest.mock('ioredis', () => require('ioredis-mock/jest'))
