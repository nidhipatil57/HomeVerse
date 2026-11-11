import type { Visitor } from "@/types";

export interface GeneratePassImageOptions {
  societyName?: string;
  societyTagline?: string;
}

/**
 * Draws rounded rectangle with cross-browser compatibility
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

/**
 * Retrieves the QR image from the DOM (either from QRCodeCanvas or QRCodeSVG)
 */
async function getQrImage(): Promise<CanvasImageSource | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    // 1. Try QRCodeCanvas
    const qrCanvas = document.getElementById("visitor-pass-qr-canvas") as HTMLCanvasElement | null;
    if (qrCanvas && qrCanvas.width > 0) {
      return qrCanvas;
    }

    // 2. Try QRCodeSVG
    const svgEl = document.getElementById("visitor-pass-qr-svg") as SVGElement | null;
    if (svgEl) {
      try {
        const xml = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        const loaded = await new Promise<boolean>((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });
        URL.revokeObjectURL(url);
        if (loaded) return img;
      } catch (e) {
        console.warn("Failed to convert QR SVG to Image:", e);
      }
    }

    // Wait a brief tick for DOM paint
    await new Promise((r) => setTimeout(r, 40));
  }

  return null;
}

/**
 * Generates a high-resolution pass card image as a Blob (PNG)
 */
export async function generateVisitorPassBlob(
  visitor: any,
  options?: GeneratePassImageOptions
): Promise<Blob> {
  const societyName = options?.societyName || "HomeVerse Society";

  // Create canvas
  const canvas = document.createElement("canvas");
  const logicalWidth = 520;
  const logicalHeight = 670;
  const dpr = 2; // Retina 2x scale for ultra crisp text and QR code

  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create 2D canvas context");
  }

  ctx.scale(dpr, dpr);

  // Background of the canvas
  ctx.clearRect(0, 0, logicalWidth, logicalHeight);

  // 1. Card Container (Matches modal preview card)
  const cardX = 14;
  const cardY = 14;
  const cardW = logicalWidth - cardX * 2;
  const cardH = logicalHeight - cardY * 2;
  const cardRadius = 24;

  // Outer shadow
  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.08)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  // Card Background Gradient
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.clip();

  const bgGrad = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
  bgGrad.addColorStop(0, "#f8fafc"); // Slate 50
  bgGrad.addColorStop(0.45, "#f1f5f9"); // Slate 100
  bgGrad.addColorStop(1, "#e2e8f0"); // Slate 200
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Decorative Accent Circle in Top-Right
  ctx.beginPath();
  ctx.arc(cardX + cardW - 8, cardY + 8, 85, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(99, 102, 241, 0.12)"; // Indigo tint
  ctx.fill();

  // Card Border
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(203, 213, 225, 0.85)";
  ctx.stroke();

  // 2. Header: Society Name & Gate Pass Tag
  ctx.textBaseline = "middle";

  // Pre-approved tag
  const tagX = cardX + 22;
  const tagY = cardY + 34;
  drawRoundedRect(ctx, tagX, tagY - 11, 108, 22, 11);
  ctx.fillStyle = "rgba(99, 102, 241, 0.14)";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(99, 102, 241, 0.28)";
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.font = "bold 9.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#4f46e5";
  ctx.fillText("PRE-APPROVED", tagX + 13, tagY);

  // Society Brand
  ctx.textAlign = "right";
  ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#334155";
  ctx.fillText(societyName.toUpperCase(), cardX + cardW - 22, tagY);

  // Header separator line
  ctx.beginPath();
  ctx.moveTo(cardX + 20, cardY + 54);
  ctx.lineTo(cardX + cardW - 20, cardY + 54);
  ctx.strokeStyle = "rgba(226, 232, 240, 0.8)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Modal Title Header
  ctx.textAlign = "center";
  ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0f172a";
  ctx.fillText("Visitor Gate Pass 🎟️", logicalWidth / 2, cardY + 80);

  // 3. QR Code Card Container Box
  const qrBoxSize = 168;
  const qrBoxX = (logicalWidth - qrBoxSize) / 2;
  const qrBoxY = cardY + 104;
  const qrBoxRadius = 18;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.06)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, qrBoxRadius);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(226, 232, 240, 0.9)";
  ctx.stroke();
  ctx.restore();

  // 4. Render QR Code
  const qrImg = await getQrImage();
  const qrSize = 136;
  const qrX = qrBoxX + (qrBoxSize - qrSize) / 2;
  const qrY = qrBoxY + (qrBoxSize - qrSize) / 2;

  if (qrImg) {
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } else {
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 14px monospace";
    ctx.fillText("QR CODE", logicalWidth / 2, qrBoxY + qrBoxSize / 2);
  }

  // 5. Visitor Name & Type
  const nameY = qrBoxY + qrBoxSize + 26;
  ctx.textAlign = "center";
  ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0f172a";
  ctx.fillText(visitor.name, logicalWidth / 2, nameY);

  const typeY = nameY + 20;
  ctx.font = "500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#64748b";
  const typeText = visitor.passType 
    ? `${visitor.passType} Gate Pass`
    : (visitor.isDelivery ? `${visitor.deliveryCompany || 'Delivery'} Partner` : `${visitor.visitorType || "Visitor"} Pass`);
  ctx.fillText(typeText, logicalWidth / 2, typeY);

  // 6. Dashed Divider Line
  const dividerY = typeY + 22;
  ctx.beginPath();
  ctx.setLineDash([5, 5]);
  ctx.moveTo(cardX + 22, dividerY);
  ctx.lineTo(cardX + cardW - 22, dividerY);
  ctx.strokeStyle = "rgba(203, 213, 225, 0.85)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash

  // 7. 2x2 Details Grid
  const gridRow1Y = dividerY + 26;
  const col1X = cardX + 28;
  const col2X = cardX + cardW / 2 + 12;

  // VISITING FLAT
  ctx.textAlign = "left";
  ctx.font = "bold 9.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("VISITING FLAT", col1X, gridRow1Y);

  ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0f172a";
  ctx.fillText(visitor.visitingUnit || visitor.unit || "N/A", col1X, gridRow1Y + 20);

  // PASS GATE CODE OTP
  ctx.font = "bold 9.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("PASS GATE CODE OTP", col2X, gridRow1Y);

  ctx.font = "bold 20px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.fillStyle = "#4f46e5"; // Primary accent
  ctx.fillText(visitor.otp || "----", col2X, gridRow1Y + 20);

  // Row 2
  const gridRow2Y = gridRow1Y + 48;

  // AUTHORIZED ROLE
  ctx.font = "bold 9.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("AUTHORIZED FOR", col1X, gridRow2Y);

  const roleText = visitor.passType || visitor.visitorType || (visitor.isDelivery ? `${visitor.deliveryCompany || "Delivery"}` : "Visitor");
  ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0f172a";
  ctx.fillText(roleText, col1X, gridRow2Y + 18);

  // STATUS
  ctx.font = "bold 9.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("STATUS", col2X, gridRow2Y);

  ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#16a34a";
  ctx.fillText("Active Pass", col2X, gridRow2Y + 18);

  // 8. Security Instructions Banner at Bottom
  const bannerY = gridRow2Y + 42;
  const bannerW = cardW - 44;
  const bannerH = 50;
  const bannerX = cardX + 22;

  drawRoundedRect(ctx, bannerX, bannerY, bannerW, bannerH, 12);
  ctx.fillStyle = "rgba(99, 102, 241, 0.07)";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(99, 102, 241, 0.18)";
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.font = "600 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#334155";
  ctx.fillText("Show this QR code or share OTP at security gate for entry", logicalWidth / 2, bannerY + 20);

  ctx.font = "400 9.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText(`Pass ID: ${visitor.id} • Verified by HomeVerse`, logicalWidth / 2, bannerY + 36);

  ctx.restore();

  // Return PNG Blob
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to export canvas to PNG blob"));
      }
    }, "image/png");
  });
}

/**
 * Downloads a blob as a file
 */
export function downloadPassBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Copies a PNG image blob to the clipboard
 */
export async function copyPassImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (typeof window !== "undefined" && navigator?.clipboard?.write && typeof ClipboardItem !== "undefined") {
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      return true;
    }
  } catch (err) {
    console.warn("ClipboardItem write failed:", err);
  }
  return false;
}

/**
 * Native Web Share API to share the card image directly to WhatsApp or other apps
 */
export async function sharePassImageToApps(
  visitor: Visitor,
  options?: GeneratePassImageOptions
): Promise<{ success: boolean; method: "native-share" | "fallback"; error?: string }> {
  try {
    const blob = await generateVisitorPassBlob(visitor, options);
    const cleanName = visitor.name.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `HomeVerse_GatePass_${cleanName}.png`;
    const file = new File([blob], filename, { type: "image/png" });

    const shareText = `Hi ${visitor.name}! Here is your Visitor Gate Pass for Flat ${visitor.visitingUnit} at HomeVerse Society.\n\n🔑 Pass Gate Code OTP: ${visitor.otp}\n📅 Date: ${new Date(visitor.expectedAt || Date.now()).toLocaleDateString()}\n⏱️ Validity: One-Day Use\n\nPlease show this QR code pass or share your OTP at the security gate for entry.`;

    if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Visitor Gate Pass - ${visitor.name}`,
          text: shareText,
        });
        return { success: true, method: "native-share" };
      } catch (shareErr: any) {
        if (shareErr.name === "AbortError") {
          return { success: false, method: "native-share", error: "User cancelled share" };
        }
      }
    }

    // Fallback: Copy image to clipboard & download image
    const copied = await copyPassImageToClipboard(blob);
    downloadPassBlob(blob, filename);

    return {
      success: true,
      method: "fallback",
      error: copied
        ? "Pass image copied to clipboard and downloaded! You can paste (Ctrl+V) directly into WhatsApp Web or other apps."
        : "Pass image downloaded! You can attach it to WhatsApp or other apps.",
    };
  } catch (err: any) {
    console.error("Error generating/sharing pass image:", err);
    return { success: false, method: "fallback", error: err?.message || "Failed to generate pass image" };
  }
}

/**
 * Specifically share to WhatsApp
 * On mobile devices, triggers native share with file so WhatsApp appears as direct target.
 * On desktop, copies image to clipboard, downloads PNG, and opens WhatsApp Web with details.
 */
export async function sharePassCardToWhatsApp(
  visitor: Visitor,
  options?: GeneratePassImageOptions
): Promise<{ directShare: boolean; message: string }> {
  const blob = await generateVisitorPassBlob(visitor, options);
  const cleanName = visitor.name.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `HomeVerse_GatePass_${cleanName}.png`;
  const file = new File([blob], filename, { type: "image/png" });

  const shareText = `🎟️ *HomeVerse Society - Visitor Gate Pass*\n\n` +
    `👤 *Visitor:* ${visitor.name}\n` +
    `🏢 *Visiting Flat:* ${visitor.visitingUnit}\n` +
    `🔑 *Pass Gate Code OTP:* ${visitor.otp}\n` +
    `📅 *Date:* ${new Date(visitor.expectedAt || Date.now()).toLocaleDateString()}\n` +
    `⏱️ *Validity:* One-Day Use\n\n` +
    `📲 *Pass Card Image:* Show this QR code pass image or share OTP at the gate for instant entry.`;

  // 1. Try native Web Share (mobile browser will open WhatsApp directly with the image attached!)
  if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `Visitor Gate Pass - ${visitor.name}`,
        text: shareText,
      });
      return { directShare: true, message: "Pass card image shared via native share!" };
    } catch (err: any) {
      if (err.name === "AbortError") {
        return { directShare: false, message: "Share cancelled" };
      }
    }
  }

  // 2. Desktop fallback: Copy image to clipboard, download PNG pass, and launch WhatsApp
  const copied = await copyPassImageToClipboard(blob);
  downloadPassBlob(blob, filename);

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  window.open(whatsappUrl, "_blank");

  return {
    directShare: false,
    message: copied
      ? "Pass image copied to clipboard & downloaded! WhatsApp opened — press Ctrl+V to paste the pass image."
      : "Pass image downloaded! WhatsApp opened — attach the downloaded pass image.",
  };
}
