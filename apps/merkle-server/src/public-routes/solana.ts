import { Type, Static } from "@sinclair/typebox";
import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";

// Define the schema for the querystring
const GetStatusQuerystringSchema = Type.Object({
  mpid: Type.String(),
});
// Infer the static type for the querystring
type GetStatusQuerystring = Static<typeof GetStatusQuerystringSchema>;

// Define the schema for the response
const GetStatusResponseSchema = Type.Object({
  status: Type.String(),
  confirmationTime: Type.Optional(Type.Number()),
});
// Infer the static type for the response
type GetStatusResponse = Static<typeof GetStatusResponseSchema>;

export async function routes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  fastify.get<{
    Querystring: GetStatusQuerystring;
    Reply: GetStatusResponse;
  }>(
    "/status",
    {
      schema: {
        querystring: GetStatusQuerystringSchema,
        response: {
          200: GetStatusResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { mpid } = request.query;

      return { status: "confirmed" };
    }
  );
}
