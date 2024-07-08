import { defineStore } from 'pinia'

export type User = {
    email: string
}

export const useUserStore = defineStore('user', () => {
    const user = ref<User | null>(null);

    const set = async () => {
        user.value = await $fetch('/api/user').catch(() => null);
    }

    return {
        user,
        set
    };
})
