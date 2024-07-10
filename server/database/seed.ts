import { db } from "./db";
import { chat_user } from "./schema";

async function seedDatabase() {
    const instance = db();
    if (!instance) return;

    console.log("Seeding database");
    await instance.delete(chat_user)
        .then(() => {
            console.info("Cleared database...");
        })
        .catch((e) => {
            console.error("Failed to clear database:", e);
            throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'Failed to clear database' });
        });

    await instance.insert(chat_user).values([])
        .then(() => {
            console.info("Seeded database...");
        })
        .catch((e) => {
            console.error("Failed to seed database:", e);
            throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'Failed to seed database' });
        });
}

export default seedDatabase;
