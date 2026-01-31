/**
 * Resend: email sending.
 * https://resend.com/docs
 */

export async function validateResendKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: {
        Authorization: "Bearer " + apiKey,
      },
    });
    return res.ok || res.status === 403; // 403 = key valid but no domains
  } catch (e) {
    console.error("Resend validation error:", e);
    return false;
  }
}
