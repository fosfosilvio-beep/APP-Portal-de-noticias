import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Fallbacks and extractions
    const title = searchParams.get("title") || "Web TV Destaque";
    const bgImage = searchParams.get("image") || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80";
    
    // Logo fallback can be hardcoded or passed. A white SVG or bold text works best for OG cards.
    const portalName = "Nossa Web TV";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            backgroundColor: "#0f172a",
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            fontFamily: "sans-serif",
          }}
        >
          {/* Overlay Dark Gradient for Readability */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 60%, rgba(15, 23, 42, 0.1) 100%)",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "60px",
              position: "relative",
              zIndex: 10,
              width: "100%",
            }}
          >
            {/* Branding/Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  background: "#00AEE0",
                  padding: "12px 24px",
                  borderRadius: "30px",
                  color: "white",
                  fontSize: "24px",
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {portalName}
              </div>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: "64px",
                fontWeight: 900,
                color: "white",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "1000px"
              }}
            >
              {title}
            </div>
            
            {/* Decorative Line */}
            <div
              style={{
                width: "120px",
                height: "8px",
                backgroundColor: "#00AEE0",
                marginTop: "40px",
                borderRadius: "4px"
              }}
            />
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
