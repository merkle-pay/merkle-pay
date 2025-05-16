import { Type, Static } from "@sinclair/typebox";
import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";

// Define the schema for the querystring
const GetTxStatusQuerystringSchema = Type.Object({
  mpid: Type.String(),
});
// Infer the static type for the querystring
type GetTxStatusQuerystring = Static<typeof GetTxStatusQuerystringSchema>;

// Define the schema for the response
const GetTxStatusResponseSchema = Type.Object({
  status: Type.String(),
  confirmationTime: Type.Optional(Type.Number()),
});
// Infer the static type for the response
type GetTxStatusResponse = Static<typeof GetTxStatusResponseSchema>;

export async function routes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  fastify.get<{
    Querystring: GetTxStatusQuerystring;
    Reply: GetTxStatusResponse;
  }>(
    "/tx-status",
    {
      schema: {
        querystring: GetTxStatusQuerystringSchema,
        response: {
          200: GetTxStatusResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { mpid } = request.query;

      try {
        const result = await fastify.pg.query(
          'SELECT * FROM "Payment" WHERE mpid = $1',
          [mpid]
        );

        console.log("result", result.rows);
      } catch (error) {
        console.error("error", error);
      }

      return { status: "confirmed" };
    }
  );
}
