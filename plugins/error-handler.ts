import { toast } from "vue-sonner"

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
        console.error(error ?? "Unknown error");
        toast.error("Unknown error");
    }
})
