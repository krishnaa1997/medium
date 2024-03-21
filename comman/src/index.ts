import {z} from 'zod';

export const signupInput=z.object({
    name: z.string().optional(),
    userName: z.string().email(),
    password: z.string().min(6)
})

export type signupInput= z.infer<typeof signupInput> 

export const signinInput=z.object({
    userName: z.string().email(),
    password: z.string().min(6)
})

export type signinInput= z.infer<typeof signinInput>

export const blogPostInput=z.object({
    title: z.string(),
    content: z.string(),
    published: z.boolean()
})

export type blogPostInput= z.infer<typeof blogPostInput>

