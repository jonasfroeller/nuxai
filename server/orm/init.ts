import { db } from './db';

const sql = `
DROP TABLE IF EXISTS deliveryAddress;
DROP TABLE IF EXISTS package;
DROP TABLE IF EXISTS orderLine;
DROP TABLE IF EXISTS _order;
DROP TABLE IF EXISTS customer;

CREATE TABLE customer (
    id SERIAL PRIMARY KEY,
    name TEXT,
    balance NUMERIC,
    "isActive" BOOLEAN
);

CREATE TABLE _order (
    id SERIAL PRIMARY KEY,
    "orderDate" TEXT,
    "customerId" INTEGER REFERENCES customer
);

CREATE TABLE orderLine (
    id SERIAL PRIMARY KEY,
    "orderId" INTEGER REFERENCES _order,
    product TEXT,
    amount NUMERIC(10,2)
);

CREATE TABLE package (
    "packageId" SERIAL PRIMARY KEY,
    "lineId" INTEGER REFERENCES orderLine,
    sscc TEXT
);

CREATE TABLE deliveryAddress (
    id SERIAL PRIMARY KEY,
    "orderId" INTEGER REFERENCES _order,
    name TEXT, 
    street TEXT,
    "postalCode" TEXT,
    "postalPlace" TEXT,
    "countryCode" TEXT
);
`;

async function init() {
    console.info("Initializing database...");

    const statements = sql.split(';');
    for (let i = 0; i < statements.length; i++) {
        await db.query(statements[i]);
    }
}

export default init;
