import { db } from "./db";
import { chat_user, chat_user_oauth_account, chat_conversation, chat_conversation_message/* , POSSIBLE_OAUTH_PROVIDERS */ } from "./schema";

// const enums = [POSSIBLE_OAUTH_PROVIDERS]
const tables = [chat_user, chat_user_oauth_account, chat_conversation, chat_conversation_message];
async function seedDatabase() {
    const instance = db();
    if (!instance) return;

    console.log("Deleting tables...");
    for (let i = 0; i < tables.length; i++) {
        await instance.delete(tables[i])
            .then(() => {
                console.info(`Deleted table ${tables[i].id.table._.name}...`);
            })
            .catch((e) => {
                console.error("Failed to delete table. Cause:", e);
                throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'Failed to clear database' });
            });
    }

    console.log("Seeding database...");

    await instance.insert(chat_user).values([]) // TODO
        .then(() => {
            console.info("Seeded database...");
        })
        .catch((e) => {
            console.error("Failed to seed database:", e);
            throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'Failed to seed database' });
        });
}

export default seedDatabase;
