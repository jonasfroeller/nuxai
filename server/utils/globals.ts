export const IS_DEV = import.meta.dev;
export const LOG_SQL_QUERIES = Boolean(process.env.LOG_SQL_QUERIES) ?? false;
export const LOG_BACKEND = Boolean(process.env.LOG_BACKEND) ?? false;
// export const IS_TEST = import.meta.test;
export const ENCRYPTION_SECRET = process.env.CRYPTO_SECRET ?? 'secret';
