/**
 * Twilio: SMS sending.
 * Credentials: Account SID:Auth Token (colon-separated) or just API key for validation.
 * https://www.twilio.com/docs
 */

export async function validateTwilioKey(credentials: string): Promise<boolean> {
  try {
    const [sid, token] = credentials.includes(":")
      ? credentials.split(":", 2)
      : [process.env.TWILIO_ACCOUNT_SID, credentials];
    if (!sid || !token) return false;
    const auth = Buffer.from(sid + ":" + token).toString("base64");
    const res = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + sid + ".json", {
      headers: {
        Authorization: "Basic " + auth,
      },
    });
    return res.ok;
  } catch (e) {
    console.error("Twilio validation error:", e);
    return false;
  }
}
