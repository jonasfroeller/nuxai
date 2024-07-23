import { toast } from 'vue-sonner';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    toast.error(`Unknown error (${error})`);
    if (LOG_FRONTEND) console.error(error, instance, info);
  };
});
