/**
 * Volcengine Ark — OpenAI-compatible Chat Completions (not Responses API).
 *
 * Usage:
 *   ARK_API_KEY=your_key ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3 \
 *   ARK_MODEL=doubao-seedream-5.0-lite node scripts/test-ark-chat.mjs
 *
 * If your console gives a different base (e.g. .../api/plan/v3), set ARK_BASE_URL accordingly.
 * This script POSTs to `${ARK_BASE_URL}/chat/completions`.
 */

const apiKey = process.env.ARK_API_KEY
const baseUrl =
  process.env.ARK_BASE_URL?.replace(/\/$/, "") ||
  "https://ark.cn-beijing.volces.com/api/v3"
const model = process.env.ARK_MODEL || "doubao-seedream-5.0-lite"
const prompt = process.env.ARK_PROMPT || "Reply with one short English sentence confirming the API works."

if (!apiKey) {
  console.error("Missing ARK_API_KEY in the environment.")
  process.exit(1)
}

const url = `${baseUrl}/chat/completions`

async function main() {
  console.log("POST", url)
  console.log("model:", model)

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 256,
    }),
  })

  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    console.error("Non-JSON response", res.status, text.slice(0, 500))
    process.exit(1)
  }

  if (!res.ok) {
    console.error("HTTP", res.status, JSON.stringify(json, null, 2))
    process.exit(1)
  }

  const choice = json?.choices?.[0]
  const content = choice?.message?.content
  console.log("OK — assistant message:")
  console.log(content ?? JSON.stringify(choice, null, 2))
  if (json?.usage) console.log("usage:", json.usage)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
