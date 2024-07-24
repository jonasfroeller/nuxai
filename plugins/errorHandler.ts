import { toast } from 'vue-sonner';

export default defineNuxtPlugin((nuxtApp) => {
  const { console } = useLogger();

  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    toast.error(`Unknown error (${error})`);
    console.error(error, instance, info);
  };
});
