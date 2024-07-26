import { HuggingFaceStream, type Message, StreamingTextResponse } from 'ai';
import { HfInference } from '@huggingface/inference';
import {
  experimental_buildOpenAssistantPrompt,
  experimental_buildLlama2Prompt,
} from 'ai/prompts';
import { ALLOWED_AI_MODELS, POSSIBLE_AI_MODELS } from '~/lib/types/ai.models';
import { validateAiModelName, validateChatIdQuery } from '~/server/utils/validate';

async function persistChatMessage(
  user_id: number,
  chat_id: number,
  messageText: string,
  actor: 'user' | 'assistant' = 'user',
  event: any
) {
  if (chat_id >= 1) {
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

    /* VALIDATE QUERY */
    const maybeChatId = await validateChatIdQuery(event);
    if (maybeChatId.statusCode !== 200) {
      return sendError(
        event,
        createError({
          statusCode: maybeChatId.statusCode,
          statusMessage: maybeChatId.statusMessage,
          data: maybeChatId.data,
        })
      );
    }
    const chat_id = maybeChatId.data?.chat_id;

    /* VALIDATE PARAMS */
    const maybeModelName = await validateAiModelName(event);
    if (maybeModelName.statusCode !== 200) {
      return sendError(
        event,
        createError({
          statusCode: maybeModelName.statusCode,
          statusMessage: maybeModelName.statusMessage,
          data: maybeModelName.data,
        })
      );
    }
    const model_name = maybeModelName.data?.model_name;
    const model_publisher = maybeModelName.data?.model_publisher;

    if (LOG_BACKEND) console.info(`Fetching model: ${model_publisher}/${model_name}...`);

    const body = await readValidatedBody(event, (body) => { // complete chat history
      return ChatConversationMessagesToCreateSchema.safeParse(body)
    });
    if (!body.success || !body.data) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'Bad Request. Invalid body(message | messages).',
          data: body.error,
        })
      );
    }
    const validatedBody = body.data;
    const { messages } = validatedBody;

    const userMessage = messages[messages.length - 1]; // { role: 'user', content: 'message' }
    // if (LOG_BACKEND) console.info("current user message", userMessage);
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

      let inputs = String(messages);
      const minimalMessages = messages as Pick<Message, "content" | "role">[];
      if (model_publisher === 'OpenAssistant' || model_publisher === '01-ai') {
        inputs = experimental_buildOpenAssistantPrompt(minimalMessages); // basically convertToCoreMessages from 'ai'
        // if (LOG_BACKEND) console.info('using custom prompt builder for OpenAssistant');
      } else if (model_publisher === 'mistralai') {
        inputs = experimental_buildLlama2Prompt(minimalMessages);
        // if (LOG_BACKEND) console.info('using custom prompt builder for Llama2');
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
