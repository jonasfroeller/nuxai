import { chat_user, chat_user_oauth_account } from '../schema';
import { and, eq, sql } from 'drizzle-orm';
import { createEmptyUser } from './users';
import { ENCRYPTION_SECRET } from '~/server/utils/globals';

type NewOauthAccount = typeof chat_user_oauth_account.$inferInsert;
// type GetOauthAccount = typeof chat_user_oauth_account.$inferSelect;

// type ReadOauthAccount = Omit<GetOauthAccount, /* "id" | "chat_user_id" | */ "provider" | "created_at" | "updated_at">;
interface OauthAccountToCreate
  extends Omit<
    NewOauthAccount,
    'id' | 'created_at' | 'updated_at' | 'chat_user_id'
  > {
  chat_user_id?: number /* so that a oauth account can be linked to an existing user */;
}

export const createOauthAccount = async (account: OauthAccountToCreate) => {
  /* TODO: if chat_user_id user exists, link account to user (use chat_user_id?) */

  /* CHECK IF OAUTH ACCOUNT ALREADY EXISTS */

  const existingOauthUser = await db.query.chat_user_oauth_account.findFirst({
    where: and(
      eq(
        chat_user_oauth_account.provider,
        account.provider,
      ) /* check if oauth account with that provider exists for existing user */,
      eq(
        chat_user_oauth_account.oauth_user_id,
        sql<string>`encode(encrypt(${account.oauth_user_id}, ${ENCRYPTION_SECRET}, 'aes'), 'hex')`,
      ) /* has the same id */,
      /* eq(chat_user_oauth_account.oauth_email, sql<string>`encode(encrypt(${account.oauth_email}, ${ENCRYPTION_SECRET}, 'aes'), 'hex')`), */ /* has the same email (TODO: not needed, could have been changed => update email instead, in that instance) */
    ),
    with: {
      chat_user: {
        columns: {
          id: true,
        },
        extras: {
          /* custom fields */
          primary_email:
            sql<string>`encode(decrypt(decode(${chat_user.primary_email}, 'hex'), ${ENCRYPTION_SECRET}, 'aes'), 'escape')`.as(
              'primary_email',
            ),
        },
      },
    },
    columns: {
      provider: true,
    },
    extras: {
      oauth_user_id:
        sql<string>`encode(decrypt(decode(${chat_user_oauth_account.oauth_user_id}, 'hex'), ${ENCRYPTION_SECRET}, 'aes'), 'escape')`.as(
          'oauth_user_id',
        ),
      oauth_email:
        sql<string>`encode(decrypt(decode(${chat_user_oauth_account.oauth_email}, 'hex'), ${ENCRYPTION_SECRET}, 'aes'), 'escape')`.as(
          'oauth_email',
        ),
    },
  });

  if (existingOauthUser) {
    return {
      isNewOauthAccount: false,
      userData: {
        ...existingOauthUser,
      },
    };
  }

  /* CREATE NEW USER AND OAUTH ACCOUNT, IF IT DOESN'T EXIST INSTEAD */

  const createdUser = await createEmptyUser();

  if (!createdUser) return null;

  const createdOauthAccount = await db
    .insert(chat_user_oauth_account)
    .values({
      provider: account.provider /* github, google */,
      oauth_user_id: sql<string>`encode(encrypt(${account.oauth_user_id}, ${ENCRYPTION_SECRET}, 'aes'), 'hex')` /* id from /auth/github or /auth/google */,
      oauth_email: sql<string>`encode(encrypt(${account.oauth_email}, ${ENCRYPTION_SECRET}, 'aes'), 'hex')` /* email from /auth/github or /auth/google */,
      chat_user_id: createdUser.id,
    })
    // @ts-ignore (is allowed, just not properly typed)
    .returning({
      provider: chat_user_oauth_account.provider,
      oauth_user_id: sql<string>`encode(decrypt(decode(${chat_user_oauth_account.oauth_user_id}, 'hex'), ${ENCRYPTION_SECRET}, 'aes'), 'escape')`,
      oauth_email: sql<string>`encode(decrypt(decode(${chat_user_oauth_account.oauth_email}, 'hex'), ${ENCRYPTION_SECRET}, 'aes'), 'escape')`,
    })
    .catch((err) => {
      if (LOG_BACKEND) console.error('Failed to insert oauth account into database', err);
      return null;
    });

  if (!createdOauthAccount) return null;

  /* TODO: set primary_email to Oauth Email */

  return {
    isNewOauthAccount: true,
    userData: {
      provider: createdOauthAccount[0].provider,
      oauth_user_id: createdOauthAccount[0].oauth_user_id,
      oauth_email: createdOauthAccount[0].oauth_email,
      chat_user: {
        id: createdUser.id,
        primary_email: createdUser.primary_email,
      },
    },
  };
};
