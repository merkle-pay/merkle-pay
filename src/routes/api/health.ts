import { createFileRoute } from "@tanstack/react-router";
import { queryOne } from "#/lib/db";

export const Route = createFileRoute("/api/health")({
	server: {
		handlers: {
			GET: async () => {
				try {
					const row = await queryOne<{ ok: number }>("SELECT 1 AS ok");
					return Response.json({
						code: 200,
						data: { db: row?.ok === 1 ? "ok" : "unexpected", now: new Date() },
						message: "ok",
					});
				} catch (err) {
					return Response.json(
						{
							code: 500,
							data: null,
							message: `db check failed: ${String(err)}`,
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
