import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/boss/sign-in")({
	component: BossSignIn,
});

function BossSignIn() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitting(true);
		try {
			const res = await fetch("/api/boss-auth/sign-in", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const body = (await res.json()) as { code: number; message: string };
			if (res.ok && body.code === 200) {
				toast.success("Signed in");
				navigate({ to: "/boss" });
			} else {
				toast.error(body.message || "Sign-in failed");
			}
		} catch (err) {
			toast.error(`Sign-in error: ${String(err)}`);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<main className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center px-6 py-12">
			<h1 className="text-2xl font-semibold tracking-tight">Boss sign-in</h1>
			<p className="mt-1 text-sm text-gray-500">
				Single owner account for this deployment.
			</p>
			<form onSubmit={onSubmit} className="mt-8 space-y-4">
				<label className="block">
					<span className="text-sm font-medium">Email</span>
					<input
						type="email"
						required
						autoComplete="username"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
					/>
				</label>
				<label className="block">
					<span className="text-sm font-medium">Password</span>
					<input
						type="password"
						required
						autoComplete="current-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
					/>
				</label>
				<button
					type="submit"
					disabled={submitting}
					className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
				>
					{submitting ? "Signing in..." : "Sign in"}
				</button>
			</form>
		</main>
	);
}
