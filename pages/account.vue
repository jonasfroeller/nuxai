<script setup lang="ts">
import Button from '~/components/ui/button/Button.vue';
import Separator from '~/components/ui/separator/Separator.vue';
import Input from '~/components/ui/input/Input.vue';
import Label from '~/components/ui/label/Label.vue';

const { session, clear } = useUserSession()

const signOut = () => {
  clear().then(() => {
    navigateTo('/home');
  })
}

definePageMeta({
  name: "Account",
  middleware: ["protected"]
})
</script>

<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold">Account</h1>
    <Separator class="h-1 my-2" />
    <AuthState>
      <template #default="{ loggedIn }">
        <Label for="email">Email</Label>
        <div class="flex gap-2">
          <Input id="email" type="email" name="email" :value="session?.user?.primary_email" :placeholder="session?.user?.primary_email" required />
          <Button type="button" v-if="loggedIn" @click="signOut" disabled>Update</Button>
        </div>
        <Separator class="h-1 my-2" />
        <b>Debug:</b> {{ session }}
        <Separator class="h-1 my-2" />
        <Button type="button" v-if="loggedIn" @click="signOut">Logout</Button>
      </template>
      <template #placeholder>
        <button disabled>Loading Account Data...</button>
      </template>
    </AuthState>
  </div>
</template>

<style scoped></style>
