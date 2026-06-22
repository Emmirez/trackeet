import { useRef } from "react";
import { X, Download, Share2, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function StoreQRModal({ storeName, businessName, onClose }) {
  const qrRef = useRef(null);
  const storeUrl = `${window.location.origin}/store/${storeName}`;

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    // Add padding and branding to the download
    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = size + 80;
    const ctx = canvas.getContext("2d");

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw QR
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 20, 20, size - 40, size - 40);
      URL.revokeObjectURL(svgUrl);

      // Business name
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.fillText(businessName || "My Store", size / 2, size + 20);

      // URL
      ctx.fillStyle = "#6C38FF";
      ctx.font = "13px Arial";
      ctx.fillText(storeUrl, size / 2, size + 45);

      // Powered by
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px Arial";
      ctx.fillText("Powered by Trackeet", size / 2, size + 68);

      // Download
      const link = document.createElement("a");
      link.download = `${storeName}-qr-code.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = svgUrl;
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: businessName, url: storeUrl });
    } else {
      navigator.clipboard.writeText(storeUrl);
      alert("Store link copied!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700">
          <div>
            <h3 className="font-bold text-dark dark:text-white">
              Store QR Code
            </h3>
            <p className="text-xs text-dark-400">
              Customers scan to visit your store
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} className="text-dark-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* QR Code */}
          <div ref={qrRef} className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
              <QRCodeSVG
                value={storeUrl}
                size={200}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/Trackeet-logo.png",
                  x: undefined,
                  y: undefined,
                  height: 36,
                  width: 36,
                  excavate: true,
                }}
              />
            </div>
            <p className="text-sm font-bold text-dark dark:text-white mt-3">
              {businessName}
            </p>
            <p className="text-xs text-primary mt-0.5">{storeUrl}</p>
          </div>

          {/* Instructions */}
          <div className="bg-primary-light dark:bg-primary/10 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-primary">
              How to use your QR Code:
            </p>
            {[
              "Print and place at your shop entrance",
              "Add to flyers, banners and business cards",
              "Share on WhatsApp and social media",
              "Customers scan to browse and order",
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-bold">
                    {i + 1}
                  </span>
                </div>
                <p className="text-xs text-dark-500 dark:text-gray-400">{t}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={downloadQR}
              className="btn btn-primary flex items-center justify-center gap-2"
            >
              <Download size={16} /> Download
            </button>
            <button
              onClick={handleShare}
              className="btn btn-ghost border border-dark-200 dark:border-gray-700 flex items-center justify-center gap-2"
            >
              <Share2 size={16} /> Share Link
            </button>
          </div>

          <a
            href={`/store/${storeName}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost border border-dark-200 dark:border-gray-700 w-full flex items-center justify-center gap-2"
          >
            <ExternalLink size={16} /> Preview Store
          </a>
        </div>
      </div>
    </div>
  );
}
