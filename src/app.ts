import fastify from "fastify";
import cookie from "@fastify/cookie";

const app = fastify({ logger: true });

app.register(cookie);

export default app;
