import { Prisma } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { getErrorResponse } from '../lib/errors.js';

describe('getErrorResponse', () => {
  it('maps Prisma initialization failures to 503', () => {
    const error = new Prisma.PrismaClientInitializationError('db down', '7.8.0');

    expect(getErrorResponse(error)).toEqual({
      status: 503,
      message: 'Database unavailable',
      code: 'PRISMA_INIT',
    });
  });

  it('maps missing schema errors to 503', () => {
    const error = new Prisma.PrismaClientKnownRequestError('table missing', {
      code: 'P2021',
      clientVersion: '7.8.0',
    });

    expect(getErrorResponse(error)).toEqual({
      status: 503,
      message: 'Database schema is not ready',
      code: 'P2021',
    });
  });

  it('preserves generic error messages', () => {
    expect(getErrorResponse(new Error('boom'))).toEqual({
      status: 500,
      message: 'boom',
    });
  });
});
