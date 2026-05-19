import { Prisma } from '@prisma/client';

type ErrorResponse = {
  status: number;
  message: string;
  code?: string;
};

export function getErrorResponse(err: unknown): ErrorResponse {
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return {
      status: 503,
      message: 'Database unavailable',
      code: 'PRISMA_INIT',
    };
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2021' || err.code === 'P2022') {
      return {
        status: 503,
        message: 'Database schema is not ready',
        code: err.code,
      };
    }

    if (err.code === 'P2002') {
      return {
        status: 409,
        message: 'Resource already exists',
        code: err.code,
      };
    }

    return {
      status: 500,
      message: 'Database request failed',
      code: err.code,
    };
  }

  if (err instanceof Error) {
    const maybeStatus = (err as Error & { status?: number }).status;
    return {
      status: typeof maybeStatus === 'number' ? maybeStatus : 500,
      message: err.message || 'Internal Server Error',
    };
  }

  return {
    status: 500,
    message: 'Internal Server Error',
  };
}
