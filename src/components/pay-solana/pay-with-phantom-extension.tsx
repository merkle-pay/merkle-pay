import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	detectPhantomExtension,
	payWithPhantomExtension,
} from "#/lib/pay-with-phantom-extension";

export function PayWithPhantomExtension({
	recipientAddress,
	referencePublicKey,
	payUrl,
	token,
	amount,
	merchantOrderId,
	splMint,
}: {
	recipientAddress: string;
	referencePublicKey: string;
	payUrl: string;
	token: string;
	amount: number;
	merchantOrderId: string;
	splMint: string | null;
}) {
	const [present, setPresent] = useState(false);
	const [pending, setPending] = useState(false);

	// Only render the button when the Phantom extension is actually injected.
	useEffect(() => {
		setPresent(detectPhantomExtension().isPhantom);
	}, []);

	if (!present) return null;

	async function onClick() {
		setPending(true);
		try {
			const { signature } = await payWithPhantomExtension({
				recipientAddress,
				referencePublicKey,
				payUrl,
				token,
				amount,
				merchantOrderId,
				splMint,
			});
			toast.success(`Submitted: ${signature.slice(0, 12)}…`);
			// Server-side polling picks up the tx via the reference key and
			// flips status; the page's existing status query will refresh.
		} catch (err) {
			console.error("Phantom extension pay failed:", err);
			const msg =
				err instanceof Error
					? `${err.name}: ${err.message}`
					: String(err);
			toast.error(msg);
		} finally {
			setPending(false);
		}
	}

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={pending}
			className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
		>
			{pending ? "Waiting for Phantom…" : "Pay with Phantom extension"}
		</button>
	);
}
