import { Prisma } from 'generated/prisma/client';

export function isPrismaExistException(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    return true;
  }
  return false;
}

export function isPrismaPrimaryKeyViolationException(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  ) {
    return true;
  }
  return false;
}
