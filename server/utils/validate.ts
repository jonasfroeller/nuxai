import { AllowedAiModelNamesEnum, AllowedAiModelPublishersEnum, AllowedAiModelsEnum } from '~/lib/types/ai.models';
import { z, ZodError } from 'zod';
import type { H3Event, EventHandlerRequest } from 'h3';
import type { User } from '#auth-utils';

/* EVENT HANDLER */

interface ValidationSuccess<T> {
  statusCode: 200;
  statusMessage: string;
  data: T;
}

interface ValidationError<T> {
  statusCode: 400 | 401;
  statusMessage: string;
  data: ZodError<T> | null;
}

type ValidationResult<S, E = S> = ValidationSuccess<S> | ValidationError<E>;

/* VALIDATE QUERY PARAMS(chat_id) */
export async function validateQueryChatId(event: H3Event<EventHandlerRequest>): Promise<ValidationResult<ChatIdQueryType>> {
  const maybeValidatedParams = await getValidatedQuery(
    event,
    (params) => {
      // @ts-ignore
      const chat_id = Number(params?.chat_id);

      return ChatIdQuerySchema.safeParse({
        chat_id,
      });
    }
  );

  if (!maybeValidatedParams.success) {
    return {
      statusCode: 400,
      statusMessage: 'Bad Request. Invalid queryParams(chat_id).',
      data: maybeValidatedParams.error,
    };
  }

  if (LOG_BACKEND) console.info(`chat_id: ${maybeValidatedParams.data.chat_id}`);

  return {
    statusCode: 200,
    statusMessage: 'Successfully validated queryParams(chat_id).',
    data: {
      chat_id: maybeValidatedParams.data.chat_id,
    }
  }
}

/* VALIDATE ROUTE PARAMS(url) */
export async function validateParamUrl(event: H3Event<EventHandlerRequest>): Promise<ValidationResult<{ url: URL }, UrlType>> {
  const maybeValidatedParams = await getValidatedRouterParams(event, UrlSchema.safeParse);

  if (!maybeValidatedParams.success) {
    return {
      statusCode: 400,
      statusMessage: 'Bad Request. Invalid routeParams(url).',
      data: maybeValidatedParams.error,
    };
  }

  if (LOG_BACKEND) console.info("url:", maybeValidatedParams.data.url); // encodedURIComponent
  const decodedUrl = decodeURIComponent(maybeValidatedParams.data.url);

  try {
    const url = new URL(decodedUrl);

    return {
      statusCode: 200,
      statusMessage: 'Successfully validated routeParams(user_id).',
      data: {
        url: url,
      }
    }
  } catch {
    return {
      statusCode: 400,
      statusMessage: 'Bad Request. Invalid routeParams(url). URL is not conform to official URL format.',
      data: null,
    };
  }
}

/* VALIDATE ROUTE PARAMS(user_id) */
export async function validateParamUserId(event: H3Event<EventHandlerRequest>): Promise<ValidationResult<UserIdType>> {
  const user: User = event.context.user;

  const maybeValidatedParams = await getValidatedRouterParams(
    event,
    (params) => {
      // @ts-ignore
      const user_id = Number(params?.user_id); // => NaN if not a number, not present

      return UserIdSchema.safeParse({
        // check if user_id is a valid user_id
        user_id,
      });
    }
  );

  if (!maybeValidatedParams.success) {
    return {
      statusCode: 400,
      statusMessage: 'Bad Request. Invalid routeParams(user_id).',
      data: maybeValidatedParams.error,
    };
  }

  if (LOG_BACKEND) console.info("user_id:", maybeValidatedParams.data.user_id);

  if (user.id !== maybeValidatedParams.data.user_id) { // check if user has access to user information (TODO: extend in the future, to allow multiple accounts connected to one account)
    return {
      statusCode: 401,
      statusMessage: `Unauthorized. You (user_id=${user.id}) do not have access to view the user information of routeParams(user_id=${maybeValidatedParams.data.user_id}).`,
      data: null
    };
  }

  return {
    statusCode: 200,
    statusMessage: 'Successfully validated routeParams(user_id).',
    data: {
      user_id: maybeValidatedParams.data.user_id,
    }
  }
}

/* VALIDATE ROUTE PARAMS(user_id, chat_id) */
export async function validateParamChatId(event: H3Event<EventHandlerRequest>): Promise<ValidationResult<ChatIdType>> {
  const user: User = event.context.user;

  const maybeValidatedParams = await getValidatedRouterParams(
    event,
    (params) => {
      // @ts-ignore
      const user_id = Number(params?.user_id);
      // @ts-ignore
      const chat_id = Number(params?.chat_id);

      return ChatIdSchema.safeParse({
        user_id,
        chat_id,
      });
    }
  );

  if (!maybeValidatedParams.success) {
    return {
      statusCode: 400,
      statusMessage: 'Bad Request. Invalid routeParams(user_id, chat_id).',
      data: maybeValidatedParams.error,
    };
  }

  if (LOG_BACKEND) console.info(`user_id: ${maybeValidatedParams.data.user_id}, chat_id: ${maybeValidatedParams.data.chat_id}`);

  if (user.id !== maybeValidatedParams.data.user_id) { // check if user has access to user information (TODO: extend in the future, to allow multiple accounts connected to one account)
    return {
      statusCode: 401,
      statusMessage: `Unauthorized. You (user_id=${user.id}) do not have access to view the user information of routeParams(user_id=${maybeValidatedParams.data.user_id}).`,
      data: null
    };
  }

  return {
    statusCode: 200,
    statusMessage: 'Successfully validated routeParams(user_id, chat_id).',
    data: {
      user_id: maybeValidatedParams.data.user_id,
      chat_id: maybeValidatedParams.data.chat_id,
    }
  }
}

/* VALIDATE ROUTE PARAMS(user_id, chat_id, message_id) */
export async function validateParamMessageId(event: H3Event<EventHandlerRequest>): Promise<ValidationResult<ChatMessageIdType>> {
  const user: User = event.context.user;

  const maybeValidatedParams = await getValidatedRouterParams(
    event,
    (params) => {
      // @ts-ignore
      const user_id = Number(params?.user_id);
      // @ts-ignore
      const chat_id = Number(params?.chat_id);
      // @ts-ignore
      const message_id = Number(params?.message_id);

      return ChatMessageIdSchema.safeParse({
        user_id,
        chat_id,
        message_id,
      });
    }
  );

  if (!maybeValidatedParams.success) {
    return {
      statusCode: 400,
      statusMessage: 'Bad Request. Invalid routeParams(user_id, chat_id, message_id).',
      data: maybeValidatedParams.error,
    };
  }

  if (LOG_BACKEND) console.info(`user_id: ${maybeValidatedParams.data.user_id}, chat_id: ${maybeValidatedParams.data.chat_id}, message_id: ${maybeValidatedParams.data.message_id}`);

  if (user.id !== maybeValidatedParams.data.user_id) { // check if user has access to user information (TODO: extend in the future, to allow multiple accounts connected to one account)
    return {
      statusCode: 401,
      statusMessage: `Unauthorized. You (user_id=${user.id}) do not have access to view the user information of routeParams(user_id=${maybeValidatedParams.data.user_id}).`,
      data: null
    };
  }

  return {
    statusCode: 200,
    statusMessage: 'Successfully validated routeParams(user_id, chat_id).',
    data: {
      user_id: maybeValidatedParams.data.user_id,
      chat_id: maybeValidatedParams.data.chat_id,
      message_id: maybeValidatedParams.data.message_id,
    }
  }
}

/* VALIDATE ROUTE PARAMS(model_publisher, model_name) */
export async function validateParamAiModelName(event: H3Event<EventHandlerRequest>): Promise<ValidationResult<ModelType>> {
  const maybeValidatedParams = await getValidatedRouterParams(
    event,
    (params) => {
      return ModelSchema.safeParse({
        // @ts-ignore
        model_publisher: params?.model_publisher,
        // @ts-ignore
        model_name: params?.model_name,
      });
    }
  );

  if (!maybeValidatedParams.success) {
    return {
      statusCode: 400,
      statusMessage: 'Bad Request. Invalid routeParams(model_publisher, model_name).',
      data: maybeValidatedParams.error,
    };
  }

  if (LOG_BACKEND) console.info("model_publisher:", maybeValidatedParams.data.model_publisher, "model_name:", maybeValidatedParams.data.model_name);

  return {
    statusCode: 200,
    statusMessage: 'Successfully validated routeParams(model_publisher, model_name).',
    data: {
      model_publisher: maybeValidatedParams.data.model_publisher,
      model_name: maybeValidatedParams.data.model_name,
    }
  }
}

/* ROUTE PARAMETER SCHEMAs */

const primaryIdSchema = z.number().positive().int();

export const UserIdSchema = z.object({
  user_id: primaryIdSchema,
});

type UserIdType = z.infer<typeof UserIdSchema>;

export const ChatIdSchema = z.object({
  user_id: primaryIdSchema,
  chat_id: primaryIdSchema,
});

type ChatIdType = z.infer<typeof ChatIdSchema>;

export const ChatMessageIdSchema = z.object({
  user_id: primaryIdSchema,
  chat_id: primaryIdSchema,
  message_id: primaryIdSchema,
});

type ChatMessageIdType = z.infer<typeof ChatMessageIdSchema>;

/**
 * **INFO**: Doesn't use the z.url() because it doesn't allow URLs in the format of encodeURIComponent
 */
export const UrlSchema = z.object({
  url: z.string().trim()
});

type UrlType = z.infer<typeof UrlSchema>;

export const ModelSchema = z.object({
  model_publisher: z.nativeEnum(AllowedAiModelPublishersEnum),
  model_name: z.nativeEnum(AllowedAiModelNamesEnum),
});

type ModelType = z.infer<typeof ModelSchema>;

/* QUERY SCHEMAs */

/**
 * **NOTE**: can be -1, if none selected
 */
export const ChatIdQuerySchema = z.object({
  chat_id: z.number().int(),
});

type ChatIdQueryType = z.infer<typeof ChatIdQuerySchema>;

/* BODY SCHEMAs */

/* const allowedAiModelsValues = Object.values(AllowedAiModelsEnum) as [
  string,
  ...string[],
]; z.enum(allowedAiModelsValues) */
export const ChatConversationToCreateSchema = z.object({
  model: z.nativeEnum(AllowedAiModelsEnum),
  name: z.string().min(3),
});

export const ChatConversationAttributesToUpdateSchema = z.object({
  name: z.string().min(3),
})

/**
 * role: 'system' | **'user'** | **'assistant'** | 'function' | 'data' | 'tool'
 */
enum Actor {
  "user" = "user",
  "assistant" = "assistant",
}

export const ChatConversationMessagesToCreateSchema = z.object({
  messages: z.array(z.object({
    content: z.string().trim().min(1),
    role: z.nativeEnum(Actor),
  })),
});

export const ChatConversationMessagesToCreateUniversalSchema = ChatConversationMessagesToCreateSchema.or(z.object({
  message: z.string().trim().min(1),
  actor: z.nativeEnum(Actor),
}));
