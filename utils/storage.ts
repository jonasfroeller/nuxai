export const localStorageBaseKey = '@nuxai-chat';
export const localStorageTopicKey = (topic: string) => {
    return `${localStorageBaseKey}/${topic}`;
};
