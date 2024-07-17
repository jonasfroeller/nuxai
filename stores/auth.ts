import { defineStore } from 'pinia'

// $fetch fetches it on the server and a second time on the client
// useFetch is sick, for example: immediate: false => load when refresh is called.
export const useAuthStore = defineStore('auth', () => {
    const signIn = async (email: string, password: string) => {
        return await useFetch('/api/auth/login', { method: 'POST', body: { email, password } });
    }

    const signUp = async (email: string, password: string) => {
        return await useFetch('/api/auth/sign-up', { method: 'POST', body: { email, password } });
    }

    const signOut = async () => {
        return await useFetch('/api/auth/logout', { method: 'POST' });
    }

    return {
        signIn,
        signUp,
        signOut
    };
})
