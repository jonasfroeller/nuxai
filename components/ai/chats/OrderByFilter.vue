<script lang="ts" setup>
/// <reference path="../../../lib/types/vue-dndrop.d.ts" />

import { possibleOrderByColumns } from '~/lib/types/chat';
// @ts-ignore (somehow still not recognized...)
import { Container, Draggable, type DropResult } from 'vue-dndrop'; // https://amendx.github.io/vue-dndrop/guide/installation.html
import { GripVertical } from 'lucide-vue-next';

interface Filter {
  column: string;
  direction: 'asc' | 'desc';
}

const chatsFilters = useChatsFilter();
const columns: string[] = possibleOrderByColumns;
const filters = ref<Filter[]>([{ column: 'updated_at', direction: 'asc' }]);

const addFilter = () => {
  const column = availableColumns()[0];
  filters.value.push({ column, direction: 'desc' });
};

const removeFilter = (index: number) => {
  filters.value.splice(index, 1);
};

const removeAllFilters = () => {
  filters.value = [];
};

const availableColumns = (currentIndex?: number): string[] => {
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

const onDrop = (dropResult: DropResult) => {
  filters.value = applyDrag(filters.value, dropResult);
};

const applyDrag = (filters: Filter[], dropResult: DropResult): Filter[] => {
  const { removedIndex, addedIndex, payload } = dropResult;
  if (removedIndex === null && addedIndex === null) return filters;

  const result = [...filters];
  let itemToAdd = payload;

  if (removedIndex !== null) {
    itemToAdd = result.splice(removedIndex, 1)[0];
  }

  if (addedIndex !== null) {
    result.splice(addedIndex, 0, itemToAdd);
  }

  return result;
};
</script>

<template>
  <fieldset class="grid gap-2 p-4 mt-1 border rounded-lg">
    <legend class="px-1 -ml-1 text-sm font-medium">Order By Filter</legend>
    <ShadcnScrollArea class="max-h-32" v-if="filters.length > 0">
      <Container @drop="onDrop" class="flex flex-col gap-1">
        <Draggable v-for="(filter, index) in filters" :key="index">
          <div
            class="flex flex-wrap items-center gap-2 p-1 border rounded-md draggable-item bg-background"
          >
            <div class="flex items-center w-full max-w-full gap-1 xl:w-fit">
              <GripVertical class="w-8 h-8 cursor-grabbing" />
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
                    <ShadcnSelectItem value="desc">
                      Descending
                    </ShadcnSelectItem>
                  </ShadcnSelectGroup>
                </ShadcnSelectContent>
              </ShadcnSelect>
            </div>
            <ShadcnButton
              class="flex-grow w-full xl:w-fit"
              variant="destructive"
              @click="removeFilter(index)"
              >Remove</ShadcnButton
            >
          </div>
        </Draggable>
        <!-- <div v-if="filters.length === 0">
        <p class="text-center"><em>No filters</em></p>
        </div> -->
      </Container>
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
