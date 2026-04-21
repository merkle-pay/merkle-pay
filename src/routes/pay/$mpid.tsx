import { createQROptions } from "@solana/pay";
import QRCodeStyling from "@solana/qr-code-styling";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { z } from "zod";

const searchSchema = z.object({
	returnUrl: z.string().url().optional(),
});

type OrderView = {
	mpid: string;
	chain: string;
	token: string;
	amount: string;
	status: string;
	tx_id: string | null;
	expires_at: string;
	business: { name: string; slug: string };
	pay_url: string;
};

type OrderResp = {
	code: number;
	data: OrderView | null;
	message: string;
};

type StatusResp = {
	code: number;
	data: { status: string; tx_id: string | null } | null;
	message: string;
};

const SETTLED = new Set([
	"CONFIRMED",
	"FINALIZED",
	"EXPIRED",
	"FAILED",
	"CANCELLED",
	"REFUNDED",
]);
const SUCCESS = new Set(["CONFIRMED", "FINALIZED"]);
const POLL_INTERVAL_MS = 2000;
const REDIRECT_DELAY_MS = 1500;

async function fetchOrder(mpid: string): Promise<OrderResp> {
	const res = await fetch(`/api/order/${encodeURIComponent(mpid)}`);
	return (await res.json()) as OrderResp;
}

async function fetchStatus(mpid: string): Promise<StatusResp> {
	const res = await fetch(`/api/order/${encodeURIComponent(mpid)}/status`);
	return (await res.json()) as StatusResp;
}

export const Route = createFileRoute("/pay/$mpid")({
	validateSearch: (input) => searchSchema.parse(input),
	component: PayOrder,
});

function PayOrder() {
	const { mpid } = Route.useParams();
	const search = Route.useSearch();
	const { data, isLoading } = useQuery({
		queryKey: ["order", mpid],
		queryFn: () => fetchOrder(mpid),
		retry: false,
		staleTime: Infinity,
	});

	if (isLoading) {
		return (
			<main className="mx-auto max-w-lg px-6 py-16 text-gray-500">Loading…</main>
		);
	}
	if (!data || data.code !== 200 || !data.data) {
		return (
			<main className="mx-auto max-w-lg px-6 py-16">
				<h1 className="text-2xl font-semibold">Order not found</h1>
				<p className="mt-2 text-sm text-gray-500">
					{data?.message ?? "Unknown error"}
				</p>
			</main>
		);
	}

	return <PayOrderView order={data.data} returnUrl={search.returnUrl} />;
}

function PayOrderView({
	order,
	returnUrl,
}: {
	order: OrderView;
	returnUrl?: string;
}) {
	// Poll status until settled.
	const statusQuery = useQuery({
		queryKey: ["order", order.mpid, "status"],
		queryFn: () => fetchStatus(order.mpid),
		refetchInterval: (q) => {
			const s = q.state.data?.data?.status ?? order.status;
			return SETTLED.has(s) ? false : POLL_INTERVAL_MS;
		},
		refetchIntervalInBackground: false,
		retry: false,
	});

	const currentStatus =
		statusQuery.data?.data?.status ?? order.status;
	const currentTxId = statusQuery.data?.data?.tx_id ?? order.tx_id;

	// On success, redirect to returnUrl after a brief delay so the user sees the
	// confirmation state.
	useEffect(() => {
		if (!returnUrl || !SUCCESS.has(currentStatus)) return;
		const handle = setTimeout(() => {
			window.location.href = returnUrl;
		}, REDIRECT_DELAY_MS);
		return () => clearTimeout(handle);
	}, [returnUrl, currentStatus]);

	return (
		<main className="mx-auto max-w-lg px-6 py-12">
			<h1 className="text-2xl font-semibold tracking-tight">
				Pay {order.business.name}
			</h1>
			<p className="mt-1 text-sm text-gray-500">
				{order.amount} {order.token} · order <code>{order.mpid}</code>
			</p>

			<div className="mt-8 rounded-lg border border-gray-200 p-6">
				<QrBlock solanaPayUrl={order.pay_url} />
				<p className="mt-4 text-center text-xs text-gray-500">
					Scan with Phantom, Solflare, or any Solana Pay wallet
				</p>
			</div>

			<div className="mt-6 flex items-center gap-3 text-sm">
				<StatusBadge status={currentStatus} />
				{currentTxId ? (
					<a
						href={`https://explorer.solana.com/tx/${currentTxId}`}
						target="_blank"
						rel="noopener noreferrer"
						className="truncate text-gray-500 underline"
					>
						{currentTxId.slice(0, 12)}…
					</a>
				) : null}
			</div>

			{returnUrl && SUCCESS.has(currentStatus) ? (
				<p className="mt-4 text-xs text-gray-500">
					Redirecting to <code>{returnUrl}</code>…
				</p>
			) : null}
		</main>
	);
}

function StatusBadge({ status }: { status: string }) {
	const tone = SUCCESS.has(status)
		? "bg-emerald-100 text-emerald-800"
		: status === "EXPIRED" || status === "FAILED" || status === "CANCELLED"
			? "bg-red-100 text-red-800"
			: "bg-gray-100 text-gray-800";
	return (
		<span
			className={`rounded-md px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${tone}`}
		>
			{status}
		</span>
	);
}

const QR_SIZE = 320;

function QrBlock({ solanaPayUrl }: { solanaPayUrl: string }) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		el.innerHTML = "";
		// createQROptions from @solana/pay produces the styling defaults Solana
		// wallets expect; we then point the centered image at /logo.svg which
		// is served statically from public/.
		const options = createQROptions(solanaPayUrl, QR_SIZE);
		options.image = "/logo.svg";
		const qr = new QRCodeStyling(options);
		qr.append(el);
	}, [solanaPayUrl]);

	return (
		<div
			ref={containerRef}
			aria-label="Solana Pay QR code"
			className="mx-auto"
			style={{ width: QR_SIZE, height: QR_SIZE }}
		/>
	);
}
