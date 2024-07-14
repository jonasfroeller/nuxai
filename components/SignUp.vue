<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { displaySignInResponseError } from '~/lib/feedback';
import { Icon } from '@iconify/vue'
import Separator from './ui/separator/Separator.vue';

const userStore = useUserStore()
const { fetch } = useUserSession()
const email = ref('');
const password = ref('');

function signUp() {
  userStore.signUp(email.value, password.value)
  .then(async () => {
    /* reloadNuxtApp({ ttl: 0, force: true, persistState: false, path: "/dashboard" }); */
    await fetch();
    navigateTo('/dashboard', {
      redirectCode: 303
    })
  })
  .catch((error) => {
    console.log("error" + error);
    displaySignInResponseError(error);
  })
}
</script>

<template>
  <div>
    <Card class="max-w-sm mx-auto">
      <CardHeader>
        <CardTitle class="text-xl">
          Sign Up
        </CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" name="email" v-model="email" placeholder="m@example.com" required />
          </div>
          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input id="password" type="password" name="password" v-model="password" required />
          </div>
          <Button type="button" class="w-full" @click="signUp()">
            Create an account
          </Button>
          <Separator label="or Oauth" class="my-2" />
          <div class="flex flex-col gap-1">
            <Button type="button" variant="outline" class="w-full" as-child>
              <a href="/auth/google"> <!-- needs to be a instead of NuxtLink, because it is not recognized by the Nuxt router, but does exist -->
                Sign in/up with Google <Icon icon="devicon:google" class="h-[1.2rem] w-[1.2rem] ml-2" />
              </a>
            </Button>
            <Button type="button" variant="outline" class="w-full" as-child>
              <a href="/auth/github"> <!-- needs to be a instead of NuxtLink, because it is not recognized by the Nuxt router, but does exist -->
                Sign in/up with GitHub <Icon icon="ant-design:github-filled" class="h-[1.4rem] w-[1.4rem] ml-2" />
              </a>
            </Button>
          </div>
        </div>
        <div class="mt-4 text-sm text-center">
          Already have an account?
          <NuxtLink to="/login" class="underline">
            Sign in
          </NuxtLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped></style>
