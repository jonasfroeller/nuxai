<script setup lang="ts">
  const router = useRouter()
  const currentRouteTitle = titleCase(router.currentRoute.value.name?.toString() ?? "");

  function titleCase(text: string) {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
</script>

<template>
  <div>
    <Head>
      <Title>{{ currentRouteTitle }}</Title>
    </Head>
  </div>
</template>

<style scoped></style>
