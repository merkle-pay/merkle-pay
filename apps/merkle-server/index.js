import Fastify from "fastify";

const fastify = Fastify({
  logger: true,
});

fastify.get("/", (req, res) => {
  res.send("Hello World!");
});

fastify.listen({ port: 9000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server is running on ${address}`);
});
