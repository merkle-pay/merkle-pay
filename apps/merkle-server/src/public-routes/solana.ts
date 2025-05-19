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
  code: Type.Number(),
  message: Type.String(),
  data: Type.Union([
    Type.Object({
      status: Type.String(),
      txHash: Type.Optional(Type.String()),
    }),
    Type.Null(),
  ]),
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

        if (result.rowCount !== 1) {
          return reply.status(200).send({
            code: 404,
            message: "not found",
            data: {
              status: "not found",
            },
          });
        }

        const payment = result.rows[0];

        if (payment.blockchain === "solana") {
          // fetch tx status from solana
        }

        if (payment.blockchain === "tron") {
          // fetch tx status from tron
        }

        return reply.status(200).send({
          code: 200,
          message: "Blockchain not supported",
          data: null,
        });
      } catch (error) {
        console.error("error", error);
      }

      return reply.status(200).send({
        code: 500,
        message: "Internal server error",
        data: null,
      });
    }
  );
}
