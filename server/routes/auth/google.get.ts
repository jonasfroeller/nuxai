export default oauth.googleEventHandler({
    config: {
        scope: ['email'],
    },
    async onSuccess(event, { user, tokens }) {
        // console.log(user, tokens);

        const user_email = user?.email; /* maybe add email_verified, picture for icon */
        const user_id = user?.sub; /* id_token includes sub and stores other data too, expires tho */

        await setUserSession(event, {
            user: {
                id: 0, // TODO: replace with db id
                primary_email: user_email, /* TODO: only set, if none is set yet */
                oauth: {
                    google: {
                        google_id: user_id
                    }
                }
            },
            loggedInAt: new Date()
        })
        return sendRedirect(event, '/dashboard')
    }
})
