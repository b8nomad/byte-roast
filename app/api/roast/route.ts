import { NextResponse } from "next/server"

export const runtime = "edge"

const CLOUDFLARE_URI = process.env.CLOUDFLARE_URI || "https://weathered-recipe-d2b6.elishasmile31472.workers.dev";
const CLOUDFLARE_API = process.env.CLOUDFLARE_API;

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const image = formData.get("image")
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const cloudflareRes = await fetch(CLOUDFLARE_URI, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API}`,
      },
      body: (() => {
        const fd = new FormData()
        fd.append("image", image)
        return fd
      })(),
    })

    const text = await cloudflareRes.text()
    if (!cloudflareRes.ok) {
      return NextResponse.json({ error: text }, { status: cloudflareRes.status })
    }

    // Parse the response which contains nested JSON
    let roastText = text
    try {
      const parsed = JSON.parse(text)
      if (parsed.roast) {
        // If roast is a string containing JSON, parse it again
        if (typeof parsed.roast === 'string' && parsed.roast.startsWith('{')) {
          const nestedParsed = JSON.parse(parsed.roast)
          roastText = nestedParsed.roast || parsed.roast
        } else {
          roastText = parsed.roast
        }
      }
    } catch (parseError) {
      // If parsing fails, use the original text
      roastText = text
    }

    return NextResponse.json({ roast: roastText })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 })
  }
}
