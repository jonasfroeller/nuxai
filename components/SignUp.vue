<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function signUp() {
  useUserStore().signUp().then(() => {
    reloadNuxtApp({ ttl: 0, force: true, persistState: false, path: "/dashboard" });
  });
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
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label for="first-name">First name</Label>
              <Input id="first-name" placeholder="Max" required />
            </div>
            <div class="grid gap-2">
              <Label for="last-name">Last name</Label>
              <Input id="last-name" placeholder="Robinson" required />
            </div>
          </div>
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input id="password" type="password" />
          </div>
          <Button class="w-full" @click="signUp()">
            Create an account
          </Button>
          <Button variant="outline" class="w-full" as-child>
            <a href="/api/auth/github">
              Sign up with GitHub
            </a>
          </Button>
        </div>
        <div class="mt-4 text-sm text-center">
          Already have an account?
          <a href="/login" class="underline">
            Sign in
          </a>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped></style>
