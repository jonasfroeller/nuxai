import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
    const signIn = async (email: string, password: string) => {
        return await $fetch('/api/auth/login', { method: 'POST', body: { email, password } });
    }

    const signUp = async (email: string, password: string) => {
        return await $fetch('/api/auth/sign-up', { method: 'POST', body: { email, password } });
    }

    const signOut = async () => {
        return await $fetch('/api/auth/logout', { method: 'POST' });
    }

    return {
        signIn,
        signUp,
        signOut
    };
})
