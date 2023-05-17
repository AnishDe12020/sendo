import QRCodeStyling from "@solana/qr-code-styling";

export const createQR = (
  content: string | URL,
  size = 512,
  backgroundColor = "#ffffff",
  color = "#000000"
) => {
  return new QRCodeStyling({
    type: "svg",
    width: size,
    height: size,
    data: String(content),
    qrOptions: {
      typeNumber: 0,
      mode: "Byte",
      errorCorrectionLevel: "Q",
    },
    backgroundOptions: { color: backgroundColor },
    dotsOptions: { type: "extra-rounded", color },
    cornersSquareOptions: {
      type: "extra-rounded",
      color,
    },
    cornersDotOptions: { type: "square", color },
  });
};
