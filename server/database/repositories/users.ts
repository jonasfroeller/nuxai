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

/**
 * Asynchronously creates a new user in the database with the provided user details.
 *
 * @param {NewUser} user - The user object containing primary email and hashed password.
 * @return {Promise<void>} A Promise that resolves after the user is inserted or rejects if there's an error.
 * 
 * @description
 * https://stackoverflow.com/questions/2647158/how-can-i-hash-passwords-in-postgresql
 * 
 * SELECT encode(encrypt('e.mail@example.com', 'secret', 'aes'), 'hex') AS encrypted_primary_email; --encrypt
 * SELECT decrypt('\x2866794d48ffaaef22d27652555382a77dfce3e6b71b8fcb3c18ee1a5e6a466a'::bytea, 'secret', 'aes') LIKE 'e.mail@example.com' AS decrypted_primary_email; --check (\x<hex>)
 * 
 * SELECT crypt('password', gen_salt('bf', 12)) AS hashed_password; --encrypt
 * SELECT crypt('password', '$2a$12$rUibDTAV38yIModD5ufgmOnlpy89Syof3sU0QitE9J.aKdKtwH3IC') LIKE '$2a$12$rUibDTAV38yIModD5ufgmOnlpy89Syof3sU0QitE9J.aKdKtwH3IC' AS password_is_correct; --check
 */
const createUser = async (user: UserToCreate): Promise<null | RowList<never[]>> => {
    const client = db();
    if (!client) return null;

    return await client
        .insert(chat_user)
        .values({
            primary_email: sql<string>`encode(encrypt('${user.primary_email}', ${SECRET}, 'aes'), 'hex')`,
            hashed_password: sql<string>`crypt('${user.password}', gen_salt('bf', 12))`
        })
        .catch((err) => {
            console.error('Failed to insert user into database', err);
            return null;
        })
}

const readUser = async (id: number): Promise<null | ReadUser[]> => {
    const client = db();
    if (!client) return null;

    return await client
        .select({
            id: chat_user.id,
            primary_email: chat_user.primary_email
        }).from(chat_user)
        .where(
            and(
                eq(chat_user.id, id)
            )
        )
        .catch((err) => {
            console.error('Failed to fetch user from database', err)
            return null;
        })
}

const updateUser = async (id: number, primary_email: string | undefined, password: string | undefined): Promise<null | RowList<never[]>> => { /* TODO: check for old email and password */
    const client = db();
    if (!client) return null;

    const updated_primary_email = () => {
        if (!primary_email) return null;

        return {
            primary_email: sql<string>`encode(encrypt('${primary_email}', ${SECRET}, 'aes'), 'hex')`
        }
    }

    const updated_password = () => {
        if (!password) return null;

        return {
            hashed_password: sql<string>`crypt('${password}', gen_salt('bf', 12))`
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
            and(
                eq(chat_user.id, id)
            )
        )
        .catch((err) => {
            console.error('Failed to update user in database', err);
            return null;
        })
}

const deleteUser = async (id: number): Promise<null | RowList<never[]>> => {
    const client = db();
    if (!client) return null;

    return await client
        .delete(chat_user)
        .where(
            and(
                eq(chat_user.id, id)
            )
        )
        .catch((err) => {
            console.error('Failed to delete user from database', err);
            return null;
        })
}

// sql<string>`decrypt(concat('\x', 'chat_user.primary_email')::bytea, 'secret', 'aes') LIKE '${primary_email}'`
// sql<string>`crypt('${hashed_password}', 'chat_user.hashed_password') LIKE 'chat_user.hashed_password'`)
const validateUserCredentials = async (email: string, password: string) => { /* TODO: allow more than one email */
    const client = db();
    if (!client) return null;

    return await client
        .select({ id: chat_user.id })
        .from(chat_user)
        .where(
            and(
                like(chat_user.primary_email, sql<string>`encode(encrypt(${email}, ${SECRET}, 'aes'), 'hex')`),
                like(chat_user.hashed_password, sql<string>`crypt(${password}, gen_salt('bf', 12))`)
            )
        ).limit(1)
        .catch((err) => {
            console.error('Failed to fetch user from database', err);
            return null;
        })
}

/* const { data, pending } = await useFetch("", {
    lazy: true
}) */

/*
   db.query.chat_user.findMany({
        with: {
            chat_user: {
                email: true
            }
        }
    })
*/