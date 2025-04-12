export async function isHuman(turnstileToken: string): Promise<boolean> {
  const verifyEndpoint =
    "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const secret = process.env.TURNSTILE_SECRET_KEY;

  const response = await fetch(verifyEndpoint, {
    method: "POST",
    body: JSON.stringify({ secret, response: turnstileToken }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
  });
  const data = await response.json();
  return data.success;
}
