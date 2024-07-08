<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function signIn() {
  useUserStore().signIn().then(() => {
    reloadNuxtApp({ ttl: 0, force: true, persistState: false, path: "/dashboard" });
  });
}
</script>

<template>
  <div>
    <Card class="max-w-sm mx-auto">
      <CardHeader>
        <CardTitle class="text-2xl">
          Login
        </CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div class="grid gap-2">
            <div class="flex items-center">
              <Label for="password">Password</Label>
              <a href="/new-password" class="inline-block ml-auto text-sm underline">
                Forgot your password?
              </a>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button class="w-full" @click="signIn()">
            Login
          </Button>
          <Button variant="outline" class="w-full" as-child>
            <a href="/api/auth/github">
              Login with Github
            </a>
          </Button>
        </div>
        <div class="mt-4 text-sm text-center">
          Don't have an account?
          <a href="/sign-up" class="underline">
            Sign up
          </a>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped></style>
