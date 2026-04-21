import { createFileRoute } from "@tanstack/react-router";
import { getSolanaConnection } from "#/lib/solana-rpc";

// Server-side proxy for getLatestBlockhash so the client-side Phantom
// extension flow can set `transaction.recentBlockhash` without exposing the
// Helius API key to the browser.
export const Route = createFileRoute("/api/solana/blockhash")({
	server: {
		handlers: {
			GET: async () => {
				try {
					const connection = getSolanaConnection();
					const { blockhash, lastValidBlockHeight } =
						await connection.getLatestBlockhash("confirmed");
					return Response.json({
						code: 200,
						data: { blockhash, last_valid_block_height: lastValidBlockHeight },
						message: "ok",
					});
				} catch (err) {
					return Response.json(
						{
							code: 500,
							data: null,
							message: `RPC error: ${String(err)}`,
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
