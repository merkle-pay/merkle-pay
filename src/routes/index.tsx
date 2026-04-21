import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<main className="mx-auto max-w-2xl px-6 py-24">
			<h1 className="text-4xl font-semibold tracking-tight">Merkle Pay</h1>
			<p className="mt-4 text-gray-600">
				Non-custodial multi-chain payment platform. Running on Cloudflare
				Workers.
			</p>
			<p className="mt-6 text-sm text-gray-500">
				Health check:{" "}
				<a href="/api/health" className="underline">
					/api/health
				</a>
			</p>
		</main>
	);
}
