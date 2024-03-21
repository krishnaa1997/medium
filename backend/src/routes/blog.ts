import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { blogPostInput } from "@krishnaa1997/medium-blogs-clone";

export const BlogRouter= new Hono<{
	Bindings: {
		DATABASE_URL: string
    JWT_SECRET: string
	},
    Variables: {
        prisma: any
        userId: string
    }

}>()

BlogRouter.use( async (c, next)=>{
    const token= c.req.header('authorization') || '';
    if(!token) {
      c.status(403);
      return c.json({ error: "token not found" });
    }
    const userId= await verify(token, c.env.JWT_SECRET);
    if(!userId) {
      c.status(403);
      return c.json({ error: "invalid token" });
    }
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
      c.set('prisma', prisma)
      c.set('userId',userId.id)
    await next();
  })
  
  BlogRouter.post('/', async (c) => {

    const body= await c.req.json();
    const {success}= blogPostInput.safeParse(body);
    if(!success){
        c.status(400);
        return c.json({message: "Inputs are not correct"});
    }

    try{
        const prisma= c.get("prisma")
        const userId= c.get('userId');
        const blog = await prisma.post.create({
            data: {
              title: body.title,
              content: body.content,
              published: body.published,
              authorId: userId
            }
          })
          return c.json({
            status: 200,
            message: 'Blog created successfully',
            data: blog
          })
    }
    catch(e) {
      c.status(403);
      return c.json({ error: e });
    }
  })
  
  BlogRouter.put('/', async(c) => {
    const body= await c.req.json();

    try{
        const prisma= c.get("prisma");
        const updatedBlog = await prisma.post.update({
            where:{
                id: body.id
            },
            data: {
              title: body.title,
              content: body.content,
            }
          })
          return c.json({
            status: 200,
            message: 'Blog updated successfully',
            data: updatedBlog
          })
    }
    catch(e) {
      c.status(403);
      return c.json({ error: e });
    }
  })
  
  BlogRouter.get('/:id', async(c) => {
    const id= c.req.param('id');

    try{
        const prisma= c.get("prisma");
        const blog = await prisma.post.findUnique({
            where: {
              id: id
            }
          })
          return c.json({
            status: 200,
            message: `blog with ${id} fetched successfully`,
            data: blog
          })
    }
    catch(e) {
      c.status(403);
      return c.json({ error: e });
    }
  })
  
  // todo: Pagination
  BlogRouter.get('/bulk', async (c) => {
    console.log("/bulk")
    try{
        const prisma= c.get("prisma");
        const blogs = await prisma.post.findMany({})
          return c.json({
            status: 200,
            message: `All Blogs`,
            data: blogs
          })
    }
    catch(e) {
      c.status(403);
      return c.json({ error: e });
    }
  })