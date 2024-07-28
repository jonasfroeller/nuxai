<script setup>
import { possibleOrderByColumns } from '~/server/utils/validate';

const chatsFilters = useChatsFilter();

const columns = possibleOrderByColumns;
const filters = ref([{ column: 'updated_at', direction: 'asc' }]);

const addFilter = () => {
  const column = availableColumns()[0];
  filters.value.push({ column, direction: 'desc' });
};

const removeFilter = (index) => {
  filters.value.splice(index, 1);
};

const removeAllFilters = () => {
  filters.value = [];
};

const availableColumns = (currentIndex) => {
  const selectedColumns = filters.value
    .map((filter) => filter.column)
    .filter((_, index) => index !== currentIndex);
  return columns.filter((column) => !selectedColumns.includes(column));
};

const queryString = computed(() => {
  const orderByParts = filters.value
    .filter((filter) => filter.column)
    .map((filter) => `${filter.column}:${filter.direction}`);

  const orderByFilter =
    orderByParts.length > 0 ? `order_by=${orderByParts.join(',')}` : '';
  chatsFilters.value = orderByFilter;
  return orderByFilter;
});
</script>

<template>
  <fieldset class="grid gap-2 p-4 mt-1 border rounded-lg">
    <legend class="px-1 -ml-1 text-sm font-medium">Order By Filter</legend>

    <ShadcnScrollArea class="max-h-32">
      <div class="flex flex-col gap-1">
        <div v-for="(filter, index) in filters" :key="index" class="flex gap-1">
          <ShadcnSelect v-model="filter.column">
            <ShadcnSelectTrigger>
              <ShadcnSelectValue placeholder="Select column" />
            </ShadcnSelectTrigger>
            <ShadcnSelectContent>
              <ShadcnSelectGroup>
                <ShadcnSelectLabel>Column</ShadcnSelectLabel>
                <ShadcnSelectItem
                  v-for="column in availableColumns(index)"
                  :key="column"
                  :value="column"
                >
                  {{ column }}
                </ShadcnSelectItem>
              </ShadcnSelectGroup>
            </ShadcnSelectContent>
          </ShadcnSelect>
          <ShadcnSelect v-model="filter.direction">
            <ShadcnSelectTrigger>
              <ShadcnSelectValue placeholder="Select direction" />
            </ShadcnSelectTrigger>
            <ShadcnSelectContent>
              <ShadcnSelectGroup>
                <ShadcnSelectLabel>Direction</ShadcnSelectLabel>
                <ShadcnSelectItem value="asc"> Ascending </ShadcnSelectItem>
                <ShadcnSelectItem value="desc"> Descending </ShadcnSelectItem>
              </ShadcnSelectGroup>
            </ShadcnSelectContent>
          </ShadcnSelect>
          <ShadcnButton variant="destructive" @click="removeFilter(index)"
            >Remove</ShadcnButton
          >
        </div>
        <!-- <div v-if="filters.length === 0">
        <p class="text-center"><em>No filters</em></p>
        </div> -->
      </div>
    </ShadcnScrollArea>
    <div class="flex gap-1">
      <ShadcnButton
        @click="addFilter"
        :disabled="
          availableColumns().length === 0 || filters.length === columns.length
        "
        class="w-full"
      >
        Add Filter
      </ShadcnButton>
      <ShadcnButton
        variant="destructive"
        @click="removeAllFilters"
        :disabled="filters.length === 0"
      >
        Remove All
      </ShadcnButton>
    </div>

    <DevOnly>
      <p class="break-all"><b>Preview Filter Query:</b> {{ queryString }}</p>
    </DevOnly>
  </fieldset>
</template>

<style scoped></style>
