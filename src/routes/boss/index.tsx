import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

type MeResponse = {
	code: number;
	data: { id: string; email: string; name: string | null } | null;
	message: string;
};

async function fetchMe(): Promise<MeResponse> {
	const res = await fetch("/api/boss-auth/me", { credentials: "same-origin" });
	return (await res.json()) as MeResponse;
}

export const Route = createFileRoute("/boss/")({
	component: BossHome,
});

function BossHome() {
	const navigate = useNavigate();
	const router = useRouter();
	const { data, isLoading, isError } = useQuery({
		queryKey: ["boss", "me"],
		queryFn: fetchMe,
		retry: false,
		staleTime: 0,
	});

	useEffect(() => {
		if (!isLoading && (isError || data?.code !== 200 || !data.data)) {
			navigate({ to: "/boss/sign-in" });
		}
	}, [isLoading, isError, data, navigate]);

	async function onSignOut() {
		await fetch("/api/boss-auth/sign-out", {
			method: "POST",
			credentials: "same-origin",
		});
		toast.success("Signed out");
		await router.invalidate();
		navigate({ to: "/boss/sign-in" });
	}

	if (isLoading || !data || data.code !== 200 || !data.data) {
		return (
			<main className="mx-auto max-w-2xl px-6 py-24 text-gray-500">
				Loading…
			</main>
		);
	}

	const boss = data.data;

	return (
		<main className="mx-auto max-w-4xl px-6 py-16">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">
						Boss dashboard
					</h1>
					<p className="mt-1 text-sm text-gray-500">
						Signed in as {boss.email}
						{boss.name ? ` (${boss.name})` : null}
					</p>
				</div>
				<button
					type="button"
					onClick={onSignOut}
					className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
				>
					Sign out
				</button>
			</div>
			<div className="mt-10 grid gap-4 sm:grid-cols-2">
				<Card title="Orders" href="/boss/orders" disabled />
				<Card title="Customers" href="/boss/customers" disabled />
				<Card title="Businesses" href="/boss/businesses" disabled />
				<Card title="Staff" href="/boss/staff" disabled />
			</div>
		</main>
	);
}

function Card({
	title,
	href,
	disabled,
}: {
	title: string;
	href: string;
	disabled?: boolean;
}) {
	const inner = (
		<div className="rounded-lg border border-gray-200 p-6 hover:bg-gray-50">
			<div className="text-base font-medium">{title}</div>
			<div className="mt-1 text-xs text-gray-500">
				{disabled ? "Coming in phase 3" : "Open"}
			</div>
		</div>
	);
	if (disabled) return inner;
	return <Link to={href}>{inner}</Link>;
}
