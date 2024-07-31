<script lang="ts" setup>
import { cn } from '~/lib/utils';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-vue-next';
import { uniqWith } from 'es-toolkit';

const { fetchedFiles, loadFiles } = useFetchFiles();
const { user } = useUserSession();
const { selectedAiChat, selectedAiChatIsPlayground } = useSelectedAiChat();

const selectedFileVersionId = ref<string>();
const selectedFileVersion = computed(() => {
  console.log('Selected File Version ID:', selectedFileVersionId.value);

  return versionsForSelectedFileType.value.find(
    (file) => file.id === Number(selectedFileVersionId.value)
  );
});
const selectedFileVersionDate = computed(() => {
  return selectedFileVersion.value?.updated_at
    ? new Date(selectedFileVersion.value?.updated_at)
    : null;
});
const selectedFileVersionMarkdown = computed(() => {
  return `\`\`\`${selectedFileVersion.value?.language}${
    selectedFileVersion.value?.title
      ? `:${selectedFileVersion.value?.title}`
      : ''
  }\n${selectedFileVersion.value?.text}\n\`\`\``;
});
const filetypeSearchIsOpen = ref(false);
const filetypeSearchSelectedValue = ref<string>(''); // BundledLanguage
const filetypeSearchSelectableValues = computed(() => {
  return uniqWith(
    fetchedFiles.value.map((file) => {
      return {
        value: file.language,
        label:
          supportedShikiLanguagesWithInfo.find(
            (language) => language.id === file.language
          )?.name ?? 'Unknown',
      };
    }),
    (a, b) => a.value === b.value
  );
});

const versionsForSelectedFileType = computed(() => {
  return fetchedFiles.value.filter(
    (file) => file.language === filetypeSearchSelectedValue.value
  );
});

const isLoading = ref(true);
onMounted(async () => {
  await loadFiles(user.value?.id ?? -1, selectedAiChat.value.id).then(() => {
    isLoading.value = false;
  });
});
</script>

<template>
  <div
    class="relative flex flex-col items-start order-2 h-full gap-8 2xl:order-1"
  >
    <!-- hidden md:flex -->
    <AiChatModelConfiguration />
    <fieldset class="flex flex-col w-full h-full gap-6 p-4 border rounded-lg">
      <legend class="px-1 -ml-1 text-sm font-medium">
        Generated Configuration File
      </legend>
      <div
        class="grid grid-cols-2 gap-3"
        v-if="!selectedAiChatIsPlayground && fetchedFiles.length > 0"
      >
        <div>
          <ShadcnLabel>Filetype</ShadcnLabel>
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
                    : 'Select filetype...'
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
        <div>
          <ShadcnLabel
            >Message/Version<template v-if="selectedFileVersionDate">
              (<NuxtTime
                class="text-muted-foreground"
                :datetime="selectedFileVersionDate"
                day="numeric"
                month="numeric"
                year="numeric"
                hour="numeric"
                minute="numeric"
              />)
            </template>
          </ShadcnLabel>
          <ShadcnSelect
            :disabled="filetypeSearchSelectedValue === ''"
            v-model="selectedFileVersionId"
          >
            <ShadcnSelectTrigger>
              <ShadcnSelectValue placeholder="Select a version..." />
            </ShadcnSelectTrigger>
            <ShadcnSelectContent>
              <ShadcnSelectItem
                :value="String(file.id)"
                v-for="file in versionsForSelectedFileType"
              >
                {{ file.title }} {{ file.chat_conversation_message_id }}/{{
                  file.id
                }}
                (<NuxtTime
                  class="text-muted-foreground"
                  :datetime="new Date(file.updated_at ?? new Date())"
                  day="numeric"
                  month="long"
                  year="numeric"
                  hour="numeric"
                  minute="numeric"
                  second="numeric"
                />)
              </ShadcnSelectItem>
            </ShadcnSelectContent>
          </ShadcnSelect>
        </div>
      </div>
      <div
        class="flex flex-col h-full gap-2"
        v-if="!selectedAiChatIsPlayground && fetchedFiles.length > 0"
      >
        <ShadcnLabel for="content"
          >Content of the selected version:
          <template v-if="selectedFileVersion?.title">
            &nbsp;({{ selectedFileVersion?.title }})
          </template></ShadcnLabel
        >
        <ShadcnScrollArea
          class="h-[14.45rem] flex-grow border rounded-sm bg-primary/10 max-w-[35rem]"
        >
          <template v-if="isLoading">
            <p class="px-4 py-4">
              <Loader2 class="w-4 h-4 animate-spin" />
            </p>
          </template>
          <template v-if="selectedFileVersion">
            <template v-if="!selectedFileVersion?.text">
              <p
                class="absolute px-1 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
              >
                File is empty.
              </p>
            </template>
            <template v-else>
              <ClientOnly>
                <MDC
                  class="overflow-x-auto break-words whitespace-pre-wrap"
                  :value="selectedFileVersionMarkdown"
                />
              </ClientOnly>

              <span class="absolute top-2 right-2">
                <CopyToClipboard :text="selectedFileVersion?.text" />
              </span>
            </template>
          </template>
          <template v-else>
            <p
              class="absolute px-1 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            >
              Select a file above, to view it's content.
            </p>
          </template>
          <ShadcnScrollBar class="bg-primary" orientation="horizontal" />
          <ShadcnScrollBar class="bg-primary" orientation="vertical" />
        </ShadcnScrollArea>
      </div>
      <div v-else>
        <template v-if="selectedAiChatIsPlayground">
          <h4 class="font-bold">Files are only stored for persisted chats.</h4>
          <p>
            Click on "Persist Chat History", to generated and view persisted
            fetchedFiles.
          </p>
        </template>
        <template v-else>
          <h4 class="font-bold">
            No fetchedFiles available for selected chat.
          </h4>
          <p>Chat with the AI, to generate and view fetchedFiles.</p>
        </template>
      </div>
    </fieldset>
  </div>
</template>

<style scoped>
:deep(.remark-code-title) {
  display: none;
}
</style>
