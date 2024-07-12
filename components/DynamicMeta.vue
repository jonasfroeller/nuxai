<script setup lang="ts">
  import { titleCase } from '~/lib/formatting';

  const router = useRouter()
  const currentRouteTitle = titleCase(router.currentRoute.value.name?.toString() ?? "");
</script>

<template>
  <div>
    <Head>
      <Title>{{ currentRouteTitle }}</Title>
    </Head>
  </div>
</template>

<style scoped></style>
