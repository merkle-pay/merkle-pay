import "dotenv/config";
import Fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

import { routes as publicSolanaRoutes } from "./public-routes/solana";
import { pgClient } from "./plugins/pg-client";

const fastify = Fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

fastify.get("/", (req, res) => {
  res.send("Hello World!");
});

fastify.register(pgClient);

fastify.register(publicSolanaRoutes, { prefix: "/public/solana" });

const start = async () => {
  try {
    const address = await fastify.listen({ port: 9000 });
    fastify.log.info(`Server is running on ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
