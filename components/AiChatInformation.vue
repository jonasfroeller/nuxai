<script lang="ts" setup>
import { cn } from '~/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-vue-next';

const filetypeSearchIsOpen = ref(false);
const filetypeSearchSelectedValue = ref('');
const filetypeSearchSelectableValues = ref([
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'yaml', label: 'Yaml' },
]);

const { selectedChatKey } = useSelectedAiChat(); // TODO: find out, how to recreate useChat on selectedModelApiPath => this wouldn't be needed anymore
</script>

<template>
  <div
    class="relative flex flex-col items-start order-2 h-full gap-8 2xl:order-1"
  >
    <!-- hidden md:flex -->
    <AiModelConfiguration :key="selectedChatKey" />
    <fieldset class="flex flex-col w-full h-full gap-6 p-4 border rounded-lg">
      <legend class="px-1 -ml-1 text-sm font-medium">
        Generated Configuration File
      </legend>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <ShadcnLabel
            >Version (<NuxtTime
              class="text-muted-foreground"
              :datetime="new Date()"
              day="numeric"
              month="numeric"
              year="numeric"
              hour="numeric"
              minute="numeric"
            />)</ShadcnLabel
          >
          <ShadcnSelect :default-value="'null'">
            <ShadcnSelectTrigger>
              <ShadcnSelectValue placeholder="ShadcnSelect a role" />
            </ShadcnSelectTrigger>
            <ShadcnSelectContent>
              <ShadcnSelectItem :value="'null'">
                <NuxtTime
                  class="text-muted-foreground"
                  :datetime="new Date()"
                  day="numeric"
                  month="long"
                  year="numeric"
                  hour="numeric"
                  minute="numeric"
                  second="numeric"
                />
                (+200, -322)
              </ShadcnSelectItem>
            </ShadcnSelectContent>
          </ShadcnSelect>
        </div>
        <div>
          <ShadcnLabel>Filetype</ShadcnLabel><br />
          <ShadcnPopover v-model:open="filetypeSearchIsOpen">
            <ShadcnPopoverTrigger as-child>
              <ShadcnButton
                variant="outline"
                role="combobox"
                :aria-expanded="filetypeSearchIsOpen"
                class="justify-between w-full font-normal"
              >
                {{
                  filetypeSearchSelectedValue
                    ? filetypeSearchSelectableValues.find(
                        (option) => option.value === filetypeSearchSelectedValue
                      )?.label
                    : 'ShadcnSelect filetype...'
                }}
                <ChevronsUpDown class="w-3 h-3 ml-2 opacity-50 shrink-0" />
              </ShadcnButton>
            </ShadcnPopoverTrigger>
            <ShadcnPopoverContent class="p-0 w-fit">
              <ShadcnCommand>
                <ShadcnCommandInput
                  class="h-9"
                  placeholder="Search filetype..."
                />
                <ShadcnCommandEmpty>Filetype not found.</ShadcnCommandEmpty>
                <ShadcnCommandList>
                  <ShadcnCommandGroup>
                    <ShadcnCommandItem
                      v-for="option in filetypeSearchSelectableValues"
                      :key="option.value"
                      :value="option.value"
                      @select="
                        (ev) => {
                          if (typeof ev.detail.value === 'string') {
                            filetypeSearchSelectedValue = ev.detail.value;
                          }
                          filetypeSearchIsOpen = false;
                        }
                      "
                    >
                      {{ option.label }}
                      <Check
                        :class="
                          cn(
                            'ml-auto h-4 w-4',
                            filetypeSearchSelectedValue === option.value
                              ? 'opacity-100'
                              : 'opacity-0'
                          )
                        "
                      />
                    </ShadcnCommandItem>
                  </ShadcnCommandGroup>
                </ShadcnCommandList>
              </ShadcnCommand>
            </ShadcnPopoverContent>
          </ShadcnPopover>
        </div>
      </div>
      <div class="flex flex-col h-full gap-2">
        <ShadcnLabel for="content"
          >Content of the selected version:</ShadcnLabel
        >
        <ShadcnScrollArea class="h-[14.45rem] flex-grow border rounded-sm">
          <pre id="content" class="h-full py-2">
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
  xxx
          </pre>
        </ShadcnScrollArea>
      </div>
    </fieldset>
  </div>
</template>

<style scoped></style>
