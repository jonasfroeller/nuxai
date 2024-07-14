import { chat_user } from "../schema";
import { db } from "../db";
import { and, eq, like, sql } from "drizzle-orm";
import type { RowList } from "postgres";
const SECRET = process.env.CRYPTO_SECRET ?? "secret";

type NewUser = typeof chat_user.$inferInsert;
type GetUser = typeof chat_user.$inferSelect;

type ReadUser = Omit<GetUser, "hashed_password">;
interface UserToCreate extends Omit<NewUser, "id" | "hashed_password"> {
    password: string;
};

/* TODO: check if user has access to CRUD user */

/**
 * Asynchronously creates a new user in the database with the provided user details.
 * 
 * https://stackoverflow.com/questions/2647158/how-can-i-hash-passwords-in-postgresql
 * 
 * SELECT encode(encrypt('e.mail@example.com', 'secret', 'aes'), 'hex') AS encrypted_primary_email; --encrypt
 * SELECT decrypt('\x2866794d48ffaaef22d27652555382a77dfce3e6b71b8fcb3c18ee1a5e6a466a'::bytea, 'secret', 'aes') LIKE 'e.mail@example.com' AS decrypted_primary_email; --check (\x<hex>)
 * 
 * SELECT crypt('password', gen_salt('bf', 12)) AS hashed_password; --encrypt
 * SELECT crypt('password', '$2a$12$rUibDTAV38yIModD5ufgmOnlpy89Syof3sU0QitE9J.aKdKtwH3IC') LIKE '$2a$12$rUibDTAV38yIModD5ufgmOnlpy89Syof3sU0QitE9J.aKdKtwH3IC' AS password_is_correct; --check
 */
export const createUser = async (user: UserToCreate) => {
    const client = db();
    if (!client) return null;

    /* decode(${chat_user.primary_email}, 'hex') instead of ('\x' || ${chat_user.primary_email}) instead of concat('\x', ${chat_user.primary_email}) */

    const createdUser = await client
        .insert(chat_user)
        .values({
            primary_email: sql<string>`encode(encrypt(${user.primary_email}, ${SECRET}, 'aes'), 'hex')`,
            hashed_password: sql<string>`crypt(${user.password}, gen_salt('bf', 12))`
        })
        .returning({
            id: chat_user.id,
            primary_email: sql<string>`encode(decrypt(decode(${chat_user.primary_email}, 'hex'), ${SECRET}, 'aes'), 'escape')`,
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

export const createEmptyUser = async () => { /* needed for Oauth, if no user exists yet */
    const client = db();
    if (!client) return null;

    const createdUser = await client
        .insert(chat_user)
        .values({
            primary_email: sql<string>`encode(encrypt(${"OauthAccount-" + generateUUID()}, ${SECRET}, 'aes'), 'hex')`, /* TODO: do not allow login with these if the values are set to that */
            hashed_password: sql<string>`encode(encrypt(${"NONE"}, ${SECRET}, 'aes'), 'hex')`,
        })
        .returning({
            id: chat_user.id,
            primary_email: sql<string>`encode(decrypt(decode(${chat_user.primary_email}, 'hex'), ${SECRET}, 'aes'), 'escape')`,
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
            primary_email: sql<string>`encode(decrypt(decode(${chat_user.primary_email}, 'hex'), ${SECRET}, 'aes'), 'escape')`,
        }).from(chat_user)
        .where(
            eq(chat_user.id, id)
        )
        .catch((err) => {
            console.error('Failed to fetch user from database', err)
            return null;
        })
}

export const readUserUsingPrimaryEmail = async (email: string): Promise<null | Omit<ReadUser, "created_at" | "updated_at">> => { /* Improve, so that other emails are checked too */
    const client = db();
    if (!client) return null;

    const fetchedUser = await client
        .select({
            id: chat_user.id,
            primary_email: sql<string>`encode(decrypt(decode(${chat_user.primary_email}, 'hex'), ${SECRET}, 'aes'), 'escape')`,
        }).from(chat_user)
        .where(
            like(chat_user.primary_email, sql<string>`encode(encrypt(${email}, ${SECRET}, 'aes'), 'hex')`)
        )
        .catch((err) => {
            console.error('Failed to fetch user from database', err)
            return null;
        })

    if (!fetchedUser) return null;

    return fetchedUser[0]; // [][0] => undefined :)
}

export const updateUser = async (id: number, primary_email: string | undefined, password: string | undefined) => { /* TODO: check for old email and password */
    const client = db();
    if (!client) return null;

    const updated_primary_email = () => {
        if (!primary_email) return null;

        return {
            primary_email: sql<string>`encode(decrypt(decode(${chat_user.primary_email}, 'hex'), ${SECRET}, 'aes'), 'escape')`,
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

export const deleteUser = async (id: number): Promise<null | RowList<never[]>> => {
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

// sql<string>`decrypt(concat('\x', 'chat_user.primary_email')::bytea, 'secret', 'aes') LIKE '${primary_email}'`
// sql<string>`crypt('${password}', 'chat_user.hashed_password') LIKE 'chat_user.hashed_password'`)
export const validateUserCredentials = async (email: string, password: string) => { /* TODO: allow more than one email */
    const client = db();
    if (!client) return null;

    const fetchedUser = await client
        .select({
            id: chat_user.id,
            primary_email: sql<string>`encode(decrypt(decode(${chat_user.primary_email}, 'hex'), ${SECRET}, 'aes'), 'escape')`,
        })
        .from(chat_user)
        .where(
            and(
                like(chat_user.primary_email, sql<string>`encode(encrypt(${email}, ${SECRET}, 'aes'), 'hex')`),
                like(chat_user.hashed_password, sql<string>`crypt(${password}, ${chat_user.hashed_password})`), /* sql<boolean>`crypt(${password}, ${chat_user.hashed_password}) LIKE ${chat_user.hashed_password}` */
            )
        ).limit(1)
        .catch((err) => {
            console.error('Failed to fetch user from database:', err);
            return null;
        })

    if (!fetchedUser) return null;

    return fetchedUser[0];
}
