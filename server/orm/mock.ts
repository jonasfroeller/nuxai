import { db } from './db';
import init from './init';

export async function insertRows() {
    /* await init(); */

    console.info("Inserting mock data rows...");

    const george = await db.customer.insert({
        name: 'George',
        balance: 177,
        isActive: true
    });

    const harry = await db.customer.insert({
        name: 'Harry',
        balance: 200,
        isActive: true
    });

    const orders = await db.order.insert([
        {
            orderDate: new Date(2022, 0, 11, 9, 24, 47),
            customer: george,
            deliveryAddress: {
                name: 'George',
                street: 'Node street 1',
                postalCode: '7059',
                postalPlace: 'Jakobsli',
                countryCode: 'NO'
            },
            lines: [
                { product: 'Bicycle', amount: 250 },
                { product: 'Small guitar', amount: 150 }
            ]
        },
        {
            customer: harry,
            orderDate: new Date(2021, 0, 11, 12, 22, 45),
            deliveryAddress: {
                name: 'Harry Potter',
                street: '4 Privet Drive, Little Whinging',
                postalCode: 'GU4',
                postalPlace: 'Surrey',
                countryCode: 'UK'
            },
            lines: [
                { product: 'Magic wand', amount: 300 }
            ]
        }
    ], { customer: true, deliveryAddress: true, lines: true }); // fetching strategy

    console.dir(orders, { depth: Infinity });
}
