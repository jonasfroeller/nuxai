import tables from './map';

const connectionString = process.env.DATABASE_CONNECTION_STRING || 'postgresql://localhost:5432/postgres';
export const db = tables.postgres(connectionString);
