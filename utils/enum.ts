import { z } from "zod";

const exampleType = {
    'key': 'value',
    'key2': 'value2',
} as const;

export type exampleTypeValues = (typeof exampleType)[keyof typeof exampleType]

export const exampleZod = z.object({
    title: z.enum(getObjectValues(exampleType), {
        errorMap: () => ({
            message: '',
        }),
    }),
})

export function getObjectValues<T extends Record<string, any>>(obj: T) {
    return Object.values(obj) as [(typeof obj)[keyof T]]
}
