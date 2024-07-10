import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
    const signIn = async () => {
        return await $fetch('/api/auth/login', { method: 'POST' });
    }

    const signUp = async () => {
        return await $fetch('/api/auth/sign-up', { method: 'POST' });
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
