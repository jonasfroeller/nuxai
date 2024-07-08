import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
    const signIn = async () => {
        await $fetch('/api/auth/login', { method: 'POST' }).catch(() => null)
    }

    const signUp = async () => {
        await $fetch('/api/auth/sign-up', { method: 'POST' }).catch(() => null)
    }

    const signOut = async () => {
        await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    }

    return {
        signIn,
        signUp,
        signOut
    };
})
