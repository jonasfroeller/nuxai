<script lang="ts" setup>
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '~/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-vue-next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const filetypeSearchIsOpen = ref(false);
const filetypeSearchSelectedValue = ref('');
const filetypeSearchSelectableValues = ref([
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'yaml', label: 'Yaml' },
]);
</script>

<template>
  <div
    class="relative flex-col items-start order-2 hidden gap-8 md:flex 2xl:order-1"
  >
    <AiModelConfiguration />
    <fieldset class="grid w-full gap-6 p-4 border rounded-lg">
      <legend class="px-1 -ml-1 text-sm font-medium">
        Generated Configuration File
      </legend>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <Label
            >Version (<NuxtTime
              class="text-muted-foreground"
              :datetime="new Date()"
              day="numeric"
              month="numeric"
              year="numeric"
              hour="numeric"
              minute="numeric"
            />)</Label
          >
          <Select :default-value="'null'">
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="'null'">
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
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Filetype</Label><br />
          <Popover v-model:open="filetypeSearchIsOpen">
            <PopoverTrigger as-child>
              <Button
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
                    : 'Select filetype...'
                }}
                <ChevronsUpDown class="w-3 h-3 ml-2 opacity-50 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="p-0 w-fit">
              <Command>
                <CommandInput class="h-9" placeholder="Search filetype..." />
                <CommandEmpty>Filetype not found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
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
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div class="grid gap-3">
        <Label for="content">Content of the selected version:</Label>
        <ScrollArea class="border rounded-sm">
          <pre id="content" class="min-h-[9.5rem] max-h-[20.33rem] px-4 py-2">
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
                    </pre
          >
        </ScrollArea>
      </div>
    </fieldset>
  </div>
</template>

<style scoped></style>
