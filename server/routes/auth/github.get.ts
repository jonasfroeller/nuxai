import { createOauthAccount } from "~/server/database/repositories/oauthAccount";

export default oauth.githubEventHandler({
    config: {
        emailRequired: true
    },
    async onSuccess(event, { user, tokens }) {
        // console.log(user, tokens);

        const user_email = user?.email; /* maybe add login (for username), gravatar_id or avatar_url for icon, name, location (for i18n) */
        const user_id = String(user?.id);

        const createdOrFetchedUserAndConnectedOauthAccount = await createOauthAccount({
            provider: 'github',
            oauth_user_id: user_id,
            oauth_email: user_email
        })

        if (!createdOrFetchedUserAndConnectedOauthAccount) {
            return sendError(event, createError({ statusCode: 500, statusMessage: 'Failed to create oauth account' }))
        }

        if (createdOrFetchedUserAndConnectedOauthAccount.isNewOauthAccount) {
            console.info("new oauth account created:", createdOrFetchedUserAndConnectedOauthAccount);
        } else {
            console.info("oauth account already exists:", createdOrFetchedUserAndConnectedOauthAccount);
        }

        await setUserSession(event, {
            user: {
                id: createdOrFetchedUserAndConnectedOauthAccount.userData.chat_user.id,
                primary_email: createdOrFetchedUserAndConnectedOauthAccount.userData.chat_user.primary_email,
                oauth: {
                    github: {
                        github_id: createdOrFetchedUserAndConnectedOauthAccount.userData.oauth_user_id,
                        github_email: createdOrFetchedUserAndConnectedOauthAccount.userData.oauth_email
                    }
                }
            },
            loggedInAt: new Date()
        })

        return sendRedirect(event, '/dashboard')
    }
})
