export async function isHuman(
  turnstileToken?: string | null | undefined
): Promise<boolean> {
  if (!turnstileToken) {
    return false;
  }

  const verifyEndpoint =
    "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const secret = process.env.TURNSTILE_SECRET_KEY ?? "";

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", turnstileToken);

  const response = await fetch(verifyEndpoint, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  return data.success;
}
