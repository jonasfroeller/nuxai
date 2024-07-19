<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@iconify/vue';
import Separator from '@/components/ui/separator/Separator.vue';
import {
  validateEmailInput,
  validatePasswordInput,
} from '~/lib/types/input.validation';
import { toast } from 'vue-sonner';

const userStore = useAuthStore();
const { fetch } = useUserSession();
const email = ref('');
const password = ref('');
const emailErrors = ref([]);
const passwordErrors = ref([]);

watch(email, (newEmail) => {
  emailErrors.value = validateEmailInput(newEmail);
});

watch(password, (newPassword) => {
  passwordErrors.value = validatePasswordInput(newPassword);
});

async function signIn() {
  const { error } = await userStore.signIn(
    email.value,
    password.value,
  );

  if (error.value) {
    console.log('error:', error.value?.message, error.value.data);
    emailErrors.value = error.value.data.data.issues
      .filter((issue: any) => issue.path[0] === 'email')
      .map((issue: any) => issue.message);
    passwordErrors.value = error.value.data.data.issues
      .filter((issue: any) => issue.path[0] === 'password')
      .map((issue: any) => issue.message);

    toast.error(error.value.message);
    return;
  }

  await fetch(); // reloadNuxtApp({ ttl: 0, force: true, persistState: false, path: "/dashboard" });
  navigateTo('/dashboard', {
    redirectCode: 303,
  });
}
</script>

<template>
  <div>
    <Card class="mx-2 max-full">
      <CardHeader>
        <CardTitle class="text-2xl"> Login </CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4">
          <div>
            <div class="grid gap-2 mb-1">
              <Label for="email">Email</Label>
              <Input
                @keydown.enter="signIn()"
                id="email"
                type="email"
                name="email"
                v-model="email"
                placeholder="m@example.com"
                required
              />
            </div>

            <ul v-if="emailErrors.length > 0" class="pl-5 list-disc">
              <li
                v-for="error in emailErrors"
                class="text-sm font-bold text-destructive"
              >
                {{ error }}<br />
              </li>
            </ul>
          </div>
          <div>
            <div class="grid gap-2 mb-1">
              <div class="flex items-center">
                <Label for="password">Password</Label>
                <NuxtLink
                  to="/new-password"
                  class="inline-block ml-auto text-sm underline"
                >
                  Forgot your password?
                </NuxtLink>
              </div>
              <Input
                @keydown.enter="signIn()"
                id="password"
                type="password"
                name="password"
                v-model="password"
                required
              />
            </div>

            <ul v-if="passwordErrors.length > 0" class="pl-5 list-disc">
              <li
                v-for="error in passwordErrors"
                class="text-sm font-bold text-destructive"
              >
                {{ error }}<br />
              </li>
            </ul>
          </div>

          <Button type="button" class="w-full" @click="signIn()">
            Login
          </Button>
          <Separator label="or Oauth" class="my-2" />
          <div class="flex flex-col gap-1">
            <Button type="button" variant="outline" class="w-full" as-child>
              <a href="/auth/google">
                <!-- needs to be a instead of NuxtLink, because it is not recognized by the Nuxt router, but does exist -->
                Sign in/up with Google
                <Icon
                  icon="devicon:google"
                  class="h-[1.2rem] w-[1.2rem] ml-2"
                />
              </a>
            </Button>
            <Button type="button" variant="outline" class="w-full" as-child>
              <a href="/auth/github">
                <!-- needs to be a instead of NuxtLink, because it is not recognized by the Nuxt router, but does exist -->
                Sign in/up with GitHub
                <Icon
                  icon="ant-design:github-filled"
                  class="h-[1.4rem] w-[1.4rem] ml-2"
                />
              </a>
            </Button>
          </div>
          <Separator />
        </div>
        <div class="mt-4 text-sm text-center">
          Don't have an account?
          <NuxtLink to="/sign-up" class="underline"> Sign up </NuxtLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped></style>
