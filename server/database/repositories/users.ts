import { chat_user, chat_user_oauth_account } from "../schema";
import { db } from "../db";
import { and, eq, like, sql } from "drizzle-orm";
import { ENCRYPTION_SECRET } from "~/server/utils/globals";

type NewUser = typeof chat_user.$inferInsert;
type GetUser = typeof chat_user.$inferSelect;

type ReadUser = Omit<GetUser, "hashed_password">;
interface UserToCreate extends Omit<NewUser, "id" | "hashed_password"> {
    password: string;
};

// TODO: put encryption and decryption in separate functions, to avoid code duplication
/* TODO: check if user has access to CRUD operations (make sure everything here is LGTM) */

export const createUser = async (user: UserToCreate) => { /* TODO: only allow, if email is verified via email code => needs extended login flow */
    const client = db();
    if (!client) return null;

    const createdUser = await client
        .insert(chat_user)
        .values({
            primary_email: sql<string>`encode(encrypt(${user.primary_email}, ${ENCRYPTION_SECRET}, 'aes'), 'hex')`, // SELECT encode(encrypt('e.mail@example.com', 'secret', 'aes'), 'hex') AS encrypted_primary_email; --encrypt
            hashed_password: sql<string>`crypt(${user.password}, gen_salt('bf', 12))` // SELECT crypt('password', gen_salt('bf', 12)) AS hashed_password; --encrypt
        })
        // @ts-ignore (is allowed, just not properly typed)
        .returning({
            id: chat_user.id,
            primary_email: sql<string>`encode(decrypt(decode(${chat_user.primary_email}, 'hex'), ${ENCRYPTION_SECRET}, 'aes'), 'escape')`, /* decode(${chat_user.primary_email}, 'hex') instead of ('\x' || ${chat_user.primary_email}) instead of concat('\x', ${chat_user.primary_email}) */
        })
        .catch((err) => {
            console.error('Failed to insert user into database', err);
            return null;
        })

    if (!createdUser) return null;
    return createdUser[0];
}

function generateUUID() {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

// Needed for Oauth, if no user exists yet.
export const createEmptyUser = async () => {
    const client = db();
    if (!client) return null;

    const createdUser = await client
        .insert(chat_user)
        .values({
            primary_email: sql<string>`encode(encrypt(${"OauthAccount-" + generateUUID()}, ${ENCRYPTION_SECRET}, 'aes'), 'hex')`, /* TODO: do not allow login with email and password, if email and password are placeholders */
            hashed_password: sql<string>`encode(encrypt(${"NONE"}, ${ENCRYPTION_SECRET}, 'aes'), 'hex')`,
        })
        // @ts-ignore (is allowed, just not properly typed)
        .returning({
            id: chat_user.id,
            primary_email: sql<string>`encode(decrypt(decode(${chat_user.primary_email}, 'hex'), ${ENCRYPTION_SECRET}, 'aes'), 'escape')`,
        })
        .catch((err) => {
            console.error('Failed to insert user into database', err);
            return null;
        })

    if (!createdUser) return null;
    return createdUser[0];
}

export const readUser = async (id: number): Promise<null | Omit<ReadUser, "created_at" | "updated_at">[]> => {
    const client = db();
    if (!client) return null;

    return await client
        .select({
            id: chat_user.id,
            primary_email: sql<string>`encode(decrypt(decode(${chat_user.primary_email}, 'hex'), ${ENCRYPTION_SECRET}, 'aes'), 'escape')`,
        }).from(chat_user)
        .where(
            eq(chat_user.id, id)
        )
        .catch((err) => {
            console.error('Failed to fetch user from database', err)
            return null;
        })
}

export const readUserUsingPrimaryEmail = async (email: string): Promise<null | Omit<ReadUser, "created_at" | "updated_at">> => { /* TODO: Improve, so that other emails are checked too */
    const client = db();
    if (!client) return null;

    const fetchedUser = await client
        .select({
            id: chat_user.id,
            primary_email: sql<string>`encode(decrypt(decode(${chat_user.primary_email}, 'hex'), ${ENCRYPTION_SECRET}, 'aes'), 'escape')`,
        }).from(chat_user)
        .where(
            like(chat_user.primary_email, sql<string>`encode(encrypt(${email}, ${ENCRYPTION_SECRET}, 'aes'), 'hex')`)
        )
        .catch((err) => {
            console.error('Failed to fetch user from database', err)
            return null;
        })

    if (!fetchedUser) return null;

    return fetchedUser[0]; // [][0] => undefined :)
}

export const updateUser = async (id: number, primary_email: string | undefined, password: string | undefined) => { /* TODO: check for old password, before allowing update, only allow email, if verified via email code */
    const client = db();
    if (!client) return null;

    const updated_primary_email = () => {
        if (!primary_email) return null;

        return {
            primary_email: sql<string>`encode(decrypt(decode(${chat_user.primary_email}, 'hex'), ${ENCRYPTION_SECRET}, 'aes'), 'escape')`,
        }
    }

    const updated_password = () => {
        if (!password) return null;

        return {
            updated_password: true
        }
    }

    const updatedUserInformation = {
        ...updated_primary_email(),
        ...updated_password()
    }

    return await client
        .update(chat_user)
        .set(updatedUserInformation)
        .where(
            eq(chat_user.id, id)
        )
        .catch((err) => {
            console.error('Failed to update user in database', err);
            return null;
        })
}

export const deleteUser = async (id: number) => {
    const client = db();
    if (!client) return null;

    return await client
        .delete(chat_user)
        .where(
            eq(chat_user.id, id)
        )
        .catch((err) => {
            console.error('Failed to delete user from database', err);
            return null;
        })
}

export const validateUserCredentials = async (email: string, password: string) => { /* TODO: allow more than one email */
    const client = db();
    if (!client) return null;

    const fetchedUser = await client
        .select({
            id: chat_user.id,
            primary_email: sql<string>`encode(decrypt(decode(${chat_user.primary_email}, 'hex'), ${ENCRYPTION_SECRET}, 'aes'), 'escape')`,
        })
        .from(chat_user)
        .where(
            and(
                like(chat_user.primary_email, sql<string>`encode(encrypt(${email}, ${ENCRYPTION_SECRET}, 'aes'), 'hex')`), // SELECT decrypt('\x2866794d48ffaaef22d27652555382a77dfce3e6b71b8fcb3c18ee1a5e6a466a'::bytea, 'secret', 'aes') LIKE 'e.mail@example.com' AS decrypted_primary_email; --check (\x<hex>)
                like(chat_user.hashed_password, sql<string>`crypt(${password}, ${chat_user.hashed_password})`), // SELECT crypt('password', '$2a$12$rUibDTAV38yIModD5ufgmOnlpy89Syof3sU0QitE9J.aKdKtwH3IC') LIKE '$2a$12$rUibDTAV38yIModD5ufgmOnlpy89Syof3sU0QitE9J.aKdKtwH3IC' AS password_is_correct; --check
            )
        ).limit(1)
        .catch((err) => {
            console.error('Failed to fetch user from database:', err);
            return null;
        })

    if (!fetchedUser) return null;

    return fetchedUser[0];
}

type AccountType = "BasicAuth" | "oAuth" | "GoogleAuth" | "GithubAuth";
type StatisticType = "count";

export const accountStatistics = async (accountType: AccountType, statisticType: StatisticType = "count") => {
    const client = db();
    if (!client) return null;

    let statistic = null;
    if (statisticType === "count") {
        switch (accountType) {
            case "BasicAuth": // counts all accounts
                statistic = await client
                    .select({
                        count: sql<number>`count(${chat_user.id})`,
                    })
                    .from(chat_user)
                    .catch((err) => {
                        console.error('Failed to fetch user statistics from database:', err);
                        return null;
                    })
                break;
            case "oAuth":
                statistic = await client
                    .select({
                        count: sql<number>`count(${chat_user_oauth_account.id})`,
                    })
                    .from(chat_user_oauth_account)
                    .catch((err) => {
                        console.error('Failed to fetch user statistics from database:', err);
                        return null;
                    })
                break;
            case "GoogleAuth":
                statistic = await client
                    .select({
                        count: sql<number>`count(${chat_user_oauth_account.id})`,
                    })
                    .from(chat_user_oauth_account)
                    .where(
                        like(chat_user_oauth_account.provider, 'google')
                    )
                    .catch((err) => {
                        console.error('Failed to fetch user statistics from database:', err);
                        return null;
                    })
                break;
            case "GithubAuth":
                statistic = await client
                    .select({
                        count: sql<number>`count(${chat_user_oauth_account.id})`,
                    })
                    .from(chat_user_oauth_account)
                    .where(
                        like(chat_user_oauth_account.provider, 'github')
                    )
                    .catch((err) => {
                        console.error('Failed to fetch user statistics from database:', err);
                    })
                break;
            default:
                break;
        }
    }

    if (!statistic) return null;

    return statistic[0];
}
