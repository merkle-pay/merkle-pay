import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

type BusinessMeta = {
	slug: string;
	name: string;
	chains: Array<{ chain: string; tokens: string[] }>;
};

type BusinessResp = {
	code: number;
	data: BusinessMeta | null;
	message: string;
};

async function fetchBusiness(slug: string): Promise<BusinessResp> {
	const res = await fetch(`/api/business/${encodeURIComponent(slug)}`);
	return (await res.json()) as BusinessResp;
}

// URL-param schema. All optional except `business`.
const searchSchema = z.object({
	business: z.string().optional(),
	amount: z.coerce.number().positive().optional(),
	token: z.string().optional(),
	blockchain: z.literal("solana").optional().default("solana"),
	orderId: z.string().optional(),
	payer: z.string().optional(),
	message: z.string().optional(),
	returnUrl: z.string().url().optional(),
});

export const Route = createFileRoute("/pay/")({
	validateSearch: (input) => searchSchema.parse(input),
	component: PayPage,
});

function PayPage() {
	const search = Route.useSearch();

	// Business is required — bail early if missing.
	if (!search.business) {
		return (
			<main className="mx-auto max-w-lg px-6 py-16">
				<h1 className="text-2xl font-semibold">Missing business</h1>
				<p className="mt-2 text-sm text-gray-500">
					This link is missing the <code>?business=</code> query parameter.
					Every Merkle Pay link must identify the merchant by slug.
				</p>
			</main>
		);
	}

	return <PayForm businessSlug={search.business} search={search} />;
}

function PayForm({
	businessSlug,
	search,
}: {
	businessSlug: string;
	search: z.infer<typeof searchSchema>;
}) {
	const navigate = useNavigate();
	const { data, isLoading, isError } = useQuery({
		queryKey: ["business", businessSlug],
		queryFn: () => fetchBusiness(businessSlug),
		retry: false,
	});

	const [amount, setAmount] = useState<string>(
		search.amount != null ? String(search.amount) : "",
	);
	const [token, setToken] = useState<string>(search.token ?? "");
	const [payer, setPayer] = useState<string>(search.payer ?? "");
	const [message, setMessage] = useState<string>(search.message ?? "");
	const [submitting, setSubmitting] = useState(false);

	const tokenOptions = useMemo(() => {
		if (!data?.data) return [] as string[];
		const solana = data.data.chains.find((c) => c.chain === "solana");
		return solana?.tokens ?? [];
	}, [data]);

	// Initialize token once options arrive. Prefer the URL-provided token
	// when it's in the supported list, otherwise fall back to the first.
	useEffect(() => {
		if (!token && tokenOptions.length > 0) {
			const initial =
				search.token && tokenOptions.includes(search.token)
					? search.token
					: tokenOptions[0];
			setToken(initial);
		}
	}, [token, tokenOptions, search.token]);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!token) {
			toast.error("Choose a token");
			return;
		}
		const amt = Number(amount);
		if (!(amt > 0)) {
			toast.error("Enter a positive amount");
			return;
		}
		setSubmitting(true);
		try {
			const res = await fetch("/api/order/init", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					business: businessSlug,
					amount: amt,
					token,
					blockchain: "solana",
					orderId: search.orderId,
					payer: payer || undefined,
					message: message || undefined,
					returnUrl: search.returnUrl,
				}),
			});
			const body = (await res.json()) as {
				code: number;
				data: { mpid: string } | null;
				message: string;
			};
			if (res.ok && body.code === 200 && body.data?.mpid) {
				navigate({
					to: "/pay/$mpid",
					params: { mpid: body.data.mpid },
					search: search.returnUrl ? { returnUrl: search.returnUrl } : {},
				});
			} else {
				toast.error(body.message || "Failed to create order");
			}
		} catch (err) {
			toast.error(`Error: ${String(err)}`);
		} finally {
			setSubmitting(false);
		}
	}

	if (isLoading) {
		return (
			<main className="mx-auto max-w-lg px-6 py-16 text-gray-500">Loading…</main>
		);
	}
	if (isError || !data || data.code !== 200 || !data.data) {
		return (
			<main className="mx-auto max-w-lg px-6 py-16">
				<h1 className="text-2xl font-semibold">Business not found</h1>
				<p className="mt-2 text-sm text-gray-500">
					No business exists with slug <code>{businessSlug}</code>.
				</p>
			</main>
		);
	}

	const biz = data.data;

	return (
		<main className="mx-auto max-w-lg px-6 py-12">
			<h1 className="text-2xl font-semibold tracking-tight">Pay {biz.name}</h1>
			{search.orderId ? (
				<p className="mt-1 text-sm text-gray-500">
					Order reference: <code>{search.orderId}</code>
				</p>
			) : null}

			<form onSubmit={onSubmit} className="mt-8 space-y-4">
				<label className="block">
					<span className="text-sm font-medium">Amount</span>
					<input
						type="number"
						step="any"
						min="0"
						required
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
					/>
				</label>

				<label className="block">
					<span className="text-sm font-medium">Token</span>
					<select
						required
						value={token}
						onChange={(e) => setToken(e.target.value)}
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
					>
						{tokenOptions.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>
				</label>

				<label className="block">
					<span className="text-sm font-medium">
						Your name <span className="text-gray-400">(optional)</span>
					</span>
					<input
						type="text"
						value={payer}
						onChange={(e) => setPayer(e.target.value)}
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
					/>
				</label>

				<label className="block">
					<span className="text-sm font-medium">
						Message <span className="text-gray-400">(optional)</span>
					</span>
					<input
						type="text"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
					/>
				</label>

				<button
					type="submit"
					disabled={submitting}
					className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
				>
					{submitting ? "Creating order…" : "Continue"}
				</button>
			</form>
		</main>
	);
}
