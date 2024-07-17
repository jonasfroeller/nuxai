import { createRouter, defineEventHandler } from 'h3'
import { z } from 'zod';
import { statistics } from '~/server/database/repositories/users'

const router = createRouter()

router.get('', defineEventHandler(async (event) => {
    const statistic = await statistics("BasicAuth");

    const { data, success } = await getValidatedQuery(event, params => z.object({
        account_type: z.enum(['BasicAuth', 'oAuth', 'GoogleAuth', 'GithubAuth']),
    }).safeParse(params))

    if (success) {
        switch (data.account_type) {
            case "BasicAuth":
                return {
                    ...statistic
                };
            case "oAuth":
                return await $fetch("/api/users/oauth");
            case "GoogleAuth":
                return await $fetch("/api/users/google");
            case "GithubAuth":
                return await $fetch("/api/users/github");
        }
    }

    if (!statistic) return null;

    return {
        ...statistic,
    }
}))

router.get('/oauth', defineEventHandler(async () => {
    const statistic = await statistics("oAuth");

    if (!statistic) return null;

    return {
        ...statistic,
    }
}))

router.get('/google', defineEventHandler(async () => {
    const statistic = await statistics("GoogleAuth");

    if (!statistic) return null;

    return {
        ...statistic,
    }
}))

router.get('/github', defineEventHandler(async () => {
    const statistic = await statistics("GithubAuth");

    if (!statistic) return null;

    return {
        ...statistic,
    }
}))

export default useBase('/api/users', router.handler)
