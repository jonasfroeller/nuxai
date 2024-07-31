<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Button from '~/components/ui/button/Button.vue';
import Separator from '~/components/ui/separator/Separator.vue';
import Input from '~/components/ui/input/Input.vue';
import Label from '~/components/ui/label/Label.vue';
import { Loader2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const { updateUser, deleteUser } = useUser();
const { session, clear, fetch } = useUserSession();

const emailIsNew = computed(() => {
  if (!session.value.user || !session.value.user?.primary_email) return false;
  return session.value.user?.primary_email !== updatedUser.value?.email;
});
const updatedUser = ref<{
  email: string;
  password: string;
  confirmPassword: string;
}>({
  email: session?.value.user?.primary_email ?? '',
  password: '',
  confirmPassword: '',
});
const updateAccount = async () => {
  if (!session.value.user || !session.value.user?.id) return;
  const update = await updateUser(session.value.user?.id, {
    ...updatedUser.value,
  }).then(async (data) => {
    await fetch();
    return data;
  });

  if (update.error) {
    toast.error(String(update.error));
  }
};

const deleteAccount = async () => {
  if (!session.value.user || !session.value.user?.id) return;
  await deleteUser(session.value.user?.id).then(() => {
    clear().then(() => {
      navigateTo('/home');
    });
  });
};

const signOut = () => {
  clear().then(() => {
    navigateTo('/home');
  });
};

definePageMeta({
  name: 'Account',
  middleware: ['protected'],
});
</script>

<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold">Account</h1>
    <Separator class="h-1 my-2" />
    <AuthState>
      <template #default="{ loggedIn }">
        <div class="flex flex-wrap gap-8">
          <div>
            <Label for="email">Email</Label>
            <div class="flex gap-2">
              <Input
                id="email"
                type="email"
                name="email"
                class="w-full"
                v-model="updatedUser.email"
                :placeholder="session?.user?.primary_email"
                required
              />
              <Button
                type="button"
                v-if="loggedIn"
                @click="updateAccount"
                :disabled="!emailIsNew || updatedUser.email?.trim() === ''"
              >
                Update
              </Button>
            </div>
          </div>
          <div>
            <Label for="password">Password</Label>
            <div class="flex gap-2">
              <!-- &bull; -->
              <Input
                id="password"
                type="password"
                name="password"
                v-model="updatedUser.password"
                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                required
              />
              <Input
                id="password"
                type="password"
                name="password"
                v-model="updatedUser.confirmPassword"
                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                required
              />
              <Button
                type="button"
                v-if="loggedIn"
                @click="updateAccount"
                :disabled="
                  updatedUser.password?.trim() === '' ||
                  updatedUser.confirmPassword?.trim() === '' ||
                  updatedUser.password !== updatedUser.confirmPassword
                "
              >
                Update
              </Button>
            </div>
          </div>
        </div>
        <DevOnly>
          <Separator class="h-1 my-2" />
          <b>Debug:</b> {{ session }}
        </DevOnly>
        <Separator class="h-1 my-2" />
        <Button class="mr-1" type="button" v-if="loggedIn" @click="signOut">
          Logout
        </Button>
        <AlertDialog v-if="loggedIn">
          <AlertDialogTrigger as-child>
            <Button type="button" variant="destructive"> Delete </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction as-child>
                <Button
                  type="button"
                  variant="destructive"
                  @click="deleteAccount"
                >
                  Delete
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </template>
      <template #placeholder>
        <Button disabled>
          <Loader2 class="w-4 h-4 mr-2 animate-spin" />
          Loading Account Data...
        </Button>
      </template>
    </AuthState>
  </div>
</template>

<style scoped></style>
