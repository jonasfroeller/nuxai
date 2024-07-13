export default oauth.githubEventHandler({
    config: {
        emailRequired: true
    },
    async onSuccess(event, { user, tokens }) {
        // console.log(user, tokens);

        const user_email = user?.email; /* maybe add login (for username), gravatar_id or avatar_url for icon, name, location (for i18n) */
        const user_id = user?.id;

        await setUserSession(event, {
            user: {
                id: 0, // TODO: replace with db id
                primary_email: user_email, /* TODO: only set, if none is set yet */
                oauth: {
                    github: {
                        github_id: user_id
                    }
                }
            },
            loggedInAt: new Date()
        })
        return sendRedirect(event, '/dashboard')
    }
})
