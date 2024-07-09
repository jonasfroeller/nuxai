import { chat_user } from "./migrations/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

type NewUser = typeof chat_user.$inferInsert;
type GetUser = typeof chat_user.$inferSelect;

const insertUser = async (user: NewUser) => {
    return await db.insert(chat_user).values(user);
}

const getUser = async (user: GetUser) => {
    return await db
        .select({ email: sql`lower(${chat_user.email})` })
        .from(chat_user)
        .where(eq(chat_user.id, user.id)).limit(1);
}

export const insertMockData = async () => {
    console.info("Inserting mock data...");

    return await db.insert(chat_user).values([
        { email: Date.now() + "@" + Math.random() + ".com" },
        { email: Date.now() + "@" + Math.random() + ".com" }
    ]);
}
