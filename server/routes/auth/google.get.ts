import { createOauthAccount } from '~/server/database/repositories/oauthAccounts';

export default oauth.googleEventHandler({
  config: {
    scope: ['email'],
  },
  async onSuccess(event, { user, tokens }) {
    // console.log(user, tokens);

    const user_email =
      user?.email; /* maybe add email_verified, picture for icon */
    const user_id =
      user?.sub; /* id_token includes sub and stores other data too, expires tho */

    const createdOrFetchedUserAndConnectedOauthAccount =
      await createOauthAccount({
        provider: 'google',
        oauth_user_id: user_id,
        oauth_email: user_email,
      });

    if (!createdOrFetchedUserAndConnectedOauthAccount) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: 'Failed to create oauth account',
        }),
      );
    }

    if (createdOrFetchedUserAndConnectedOauthAccount.isNewOauthAccount) {
      console.info(
        'new oauth account created:',
        createdOrFetchedUserAndConnectedOauthAccount,
      );
    } else {
      console.info(
        'oauth account already exists:',
        createdOrFetchedUserAndConnectedOauthAccount,
      );
    }

    await setUserSession(event, {
      user: {
        id: createdOrFetchedUserAndConnectedOauthAccount.userData.chat_user.id,
        primary_email:
          createdOrFetchedUserAndConnectedOauthAccount.userData.chat_user
            .primary_email,
        oauth: {
          google: {
            google_id:
              createdOrFetchedUserAndConnectedOauthAccount.userData
                .oauth_user_id,
            google_email:
              createdOrFetchedUserAndConnectedOauthAccount.userData.oauth_email,
          },
        },
      },
      loggedInAt: new Date(),
    });

    return sendRedirect(event, '/dashboard');
  },
});
