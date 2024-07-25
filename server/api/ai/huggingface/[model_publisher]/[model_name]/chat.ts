import { HuggingFaceStream, StreamingTextResponse } from 'ai';
import { HfInference } from '@huggingface/inference';
import {
  experimental_buildOpenAssistantPrompt,
  experimental_buildLlama2Prompt,
} from 'ai/prompts';
import { ALLOWED_AI_MODELS, POSSIBLE_AI_MODELS } from '~/lib/types/ai.models';

async function persistChatMessage(
  user_id: number,
  chat_id: number,
  messageText: string,
  actor: 'user' | 'assistant' = 'user',
  event: any
) {
  if (chat_id >= 1) {
    if (LOG_BACKEND) console.info('persisting chat message:', messageText);

    const persistChatMessage = await event.$fetch(
      `/api/users/${user_id}/chats/${chat_id}/messages`,
      {
        // .event.$fetch used because it contains the current session
        method: 'POST',
        body: {
          message: messageText,
          actor,
        },
      }
    );

    if (LOG_BACKEND)
      console.info(
        'persistChatMessage:',
        persistChatMessage,
        user_id,
        chat_id,
        messageText
      );
    return;
  }

  return;
}

async function persistAiChatMessage(
  user_id: number,
  chat_id: number,
  messageText: string,
  event: any
) {
  // only persists AI messages
  await persistChatMessage(user_id, chat_id, messageText, 'assistant', event);
}

async function persistUserChatMessage(
  user_id: number,
  chat_id: number,
  messageText: string,
  event: any
) {
  await persistChatMessage(user_id, chat_id, messageText, 'user', event);
}

export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().huggingfaceApiKey;
  if (!apiKey) throw new Error('Missing OpenAI API key');
  const Hf = new HfInference(apiKey);

  return defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    const chat_id_as_string = getQuery(event).chat_id;
    if (LOG_BACKEND) console.info('chat_id_as_string', chat_id_as_string);
    const chat_id = Number(chat_id_as_string);

    const model_name = getRouterParam(event, 'model_name');
    const model_publisher = getRouterParam(event, 'model_publisher');
    if (LOG_BACKEND) console.info(`Fetching model: ${model_publisher}/${model_name}...`);
    const { messages } = await readBody(event); // complete chat history

    const userMessage = messages[messages.length - 1]; // { role: 'user', content: 'message' }
    if (LOG_BACKEND) console.info(userMessage);
    await persistUserChatMessage(user.id, chat_id, userMessage.content, event);

    try {
      // if (LOG_BACKEND) console.info('allowed models:', ALLOWED_AI_MODELS);
      if (
        !model_name ||
        !model_publisher ||
        !ALLOWED_AI_MODELS.includes(`${model_publisher}/${model_name}`)
      ) {
        // if (LOG_BACKEND) console.warn(`Invalid model name or publisher: ${model_publisher}/${model_name}. Allowed are '${ALLOWED_AI_MODELS.join(', ')}'`);
        sendError(
          event,
          createError({
            statusCode: 400,
            statusMessage: 'Invalid model name or publisher',
          })
        );
      }

      let inputs = messages;
      if (model_publisher === 'OpenAssistant' || model_publisher === '01-ai') {
        inputs = experimental_buildOpenAssistantPrompt(messages); // basically convertToCoreMessages from 'ai'
        // if (LOG_BACKEND) console.info('using custom prompt builder for OpenAssistant');
      } else if (model_publisher === 'mistralai') {
        inputs = experimental_buildLlama2Prompt(messages);
        // if (LOG_BACKEND) console.info('using custom prompt builder for Llama2');
      } else {
        inputs = messages;
      }

      // if (LOG_BACKEND) console.info('---');
      // if (LOG_BACKEND) console.info('AI request:', inputs);
      // if (LOG_BACKEND) console.info('---');

      const response = Hf.textGenerationStream(
        POSSIBLE_AI_MODELS?.[model_publisher ?? 'OpenAssistant']?.[
          model_name ?? 'oasst-sft-4-pythia-12b-epoch-3.5'
        ]?.configuration(inputs)
      );

      // https://sdk.vercel.ai/docs/ai-sdk-ui/storing-messages
      const stream = HuggingFaceStream(response, {
        async onFinal(messageText: string) {
          // onCompletion, onFinal, onToken and onText is called for each token (word, punctuation)
          await persistAiChatMessage(user.id, chat_id, messageText, event);
        },
      }); // Converts the response into a friendly text-stream

      return new StreamingTextResponse(stream); // Respond with the stream
    } catch (error) {
      if (LOG_BACKEND) console.error('AI request errored:', error);
      sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
        })
      );
    }
  });
});
