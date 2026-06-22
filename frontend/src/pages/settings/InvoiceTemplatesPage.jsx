import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Download } from "lucide-react";
import { profileAPI } from "../../services/api.js";
import useAuthStore from "../../store/authStore.js";
import { generatePDF } from "../../utils/pdfTemplates.js";
import toast from "react-hot-toast";

const TEMPLATES = [
  {
    id: "classic",
    name: "Classic Purple",
    desc: "Purple gradient header with circular accent. Clean and modern.",
    preview: { header: "#7C3AED", accent: "#6366F1", text: "white" },
    colors: ["#7C3AED", "#6366F1", "#F8FAFC"],
  },
  {
    id: "minimal",
    name: "Minimal",
    desc: "Clean white design with thin borders. Simple and elegant.",
    preview: { header: "#0A0A0A", accent: "#F5F5F5", text: "#0A0A0A" },
    colors: ["#0A0A0A", "#F5F5F5", "#FFFFFF"],
  },
  {
    id: "bold",
    name: "Bold Dark",
    desc: "Dark background with yellow accent. Strong and striking.",
    preview: { header: "#0A0A0A", accent: "#FACC15", text: "#FACC15" },
    colors: ["#0A0A0A", "#FACC15", "#FFFFFF"],
  },
  {
    id: "professional",
    name: "Professional Blue",
    desc: "Navy blue corporate style. Formal and trustworthy.",
    preview: { header: "#1E3A8A", accent: "#2563EB", text: "white" },
    colors: ["#1E3A8A", "#2563EB", "#EFF6FF"],
  },
  {
    id: "warm",
    name: "Warm",
    desc: "Orange and amber tones. Friendly and approachable.",
    preview: { header: "#EA580C", accent: "#F59E0B", text: "white" },
    colors: ["#EA580C", "#F59E0B", "#FEF9C3"],
  },
];

const SAMPLE_INVOICE = {
  invoiceNumber: "INV-2026-0001",
  invoiceDate: new Date(),
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  status: "pending",
  subtotal: 50000,
  totalAmount: 50000,
  amountPaid: 0,
  balance: 50000,
  discountPercent: 0,
  items: [
    {
      name: "Web Design",
      description: "Landing page design",
      quantity: 1,
      unitPrice: 30000,
      total: 30000,
    },
    {
      name: "Logo Design",
      description: "Brand identity",
      quantity: 1,
      unitPrice: 20000,
      total: 20000,
    },
  ],
  customer: {
    name: "Jane Okafor",
    phone: "+2348012345678",
    email: "jane@example.com",
  },
  notes: "Thank you for your business!",
};

export default function InvoiceTemplatesPage() {
  const { user, updateUser } = useAuthStore();
  const qc = useQueryClient();
  const [selected, setSelected] = useState(user?.invoiceTemplate || "classic");
  const [previewing, setPreviewing] = useState(null);

  const { mutate: saveTemplate, isPending } = useMutation({
    mutationFn: (template) => profileAPI.update({ invoiceTemplate: template }),
    onSuccess: (_, template) => {
      updateUser({ ...user, invoiceTemplate: template });
      toast.success("Template saved!");
      qc.invalidateQueries(["profile"]);
    },
    onError: () => toast.error("Failed to save template"),
  });

  const handlePreview = (templateId) => {
    setPreviewing(templateId);
    const bizName = user?.businessName || "TRACKEET";
    const bizAddr = user?.businessAddress || "trackeet.ng";
    const doc = generatePDF(SAMPLE_INVOICE, templateId, bizName, bizAddr);
    doc.save(`preview-${templateId}.pdf`);
    setTimeout(() => setPreviewing(null), 2000);
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
      <div className="section-header">
        <div>
          <h1 className="page-title">Invoice Templates</h1>
          <p className="text-dark-400 text-sm">
            Choose a design for your PDF invoices
          </p>
        </div>
        <button
          onClick={() => saveTemplate(selected)}
          disabled={isPending || selected === user?.invoiceTemplate}
          className="btn btn-primary btn-sm"
        >
          {isPending ? "Saving..." : "Save Template"}
        </button>
      </div>

      {/* Current template */}
      <div className="card bg-primary-light dark:bg-primary/10 border border-primary/20">
        <p className="text-sm text-dark-400">
          Currently using:{" "}
          <strong className="text-dark dark:text-white">
            {
              TEMPLATES.find(
                (t) => t.id === (user?.invoiceTemplate || "classic"),
              )?.name
            }
          </strong>
        </p>
      </div>

      {/* Template grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => (
          <div
            key={template.id}
            onClick={() => setSelected(template.id)}
            className={`card cursor-pointer transition-all hover:shadow-lg relative ${
              selected === template.id
                ? "border-2 border-primary shadow-glow"
                : "border border-dark-200 dark:border-gray-700"
            }`}
          >
            {/* Selected badge */}
            {selected === template.id && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            )}

            {/* Template preview */}
            <div
              className="rounded-xl overflow-hidden mb-3 border border-dark-100 dark:border-gray-700"
              style={{ height: "120px" }}
            >
              {/* Mini PDF preview */}
              <div
                style={{
                  background: template.preview.header,
                  padding: "8px 10px",
                }}
              >
                <div
                  style={{
                    color: template.preview.text,
                    fontWeight: "bold",
                    fontSize: "10px",
                  }}
                >
                  {user?.businessName?.toUpperCase() || "TRACKEET"}
                </div>
                <div
                  style={{
                    color: template.preview.text,
                    opacity: 0.7,
                    fontSize: "7px",
                  }}
                >
                  trackeet.ng
                </div>
              </div>
              <div style={{ background: "#fff", padding: "8px 10px", flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "7px",
                        color: "#94a3b8",
                        marginBottom: "2px",
                      }}
                    >
                      BILLED TO
                    </div>
                    <div
                      style={{
                        fontSize: "9px",
                        fontWeight: "bold",
                        color: "#0f172a",
                      }}
                    >
                      Jane Okafor
                    </div>
                    <div style={{ fontSize: "7px", color: "#94a3b8" }}>
                      +2348012345678
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "7px", color: "#94a3b8" }}>
                      INVOICE
                    </div>
                    <div
                      style={{
                        fontSize: "9px",
                        fontWeight: "bold",
                        color: "#0f172a",
                      }}
                    >
                      INV-0001
                    </div>
                  </div>
                </div>
                {/* Mini table */}
                <div
                  style={{
                    background: template.preview.header,
                    padding: "3px 6px",
                    borderRadius: "2px",
                  }}
                >
                  <div
                    style={{
                      color:
                        template.id === "bold"
                          ? template.preview.accent
                          : "white",
                      fontSize: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    DESCRIPTION · QTY · PRICE · TOTAL
                  </div>
                </div>
                <div
                  style={{
                    padding: "3px 6px",
                    fontSize: "7px",
                    color: "#0f172a",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  Web Design · 1 · N30,000 · N30,000
                </div>
                <div
                  style={{
                    padding: "3px 6px 0",
                    textAlign: "right",
                    fontSize: "8px",
                    fontWeight: "bold",
                    color: template.preview.header,
                  }}
                >
                  Total: N50,000
                </div>
              </div>
            </div>

            {/* Template info */}
            <div className="flex items-center gap-2 mb-1">
              <div className="flex gap-1">
                {template.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full border border-dark-100"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {user?.invoiceTemplate === template.id && (
                <span className="text-[10px] font-bold text-success bg-success-light px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>

            <h3 className="font-bold text-dark dark:text-white text-sm">
              {template.name}
            </h3>
            <p className="text-xs text-dark-400 mt-0.5">{template.desc}</p>

            {/* Preview button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(template.id);
              }}
              disabled={previewing === template.id}
              className="btn btn-ghost btn-sm border border-dark-200 dark:border-gray-600 w-full mt-3 text-xs"
            >
              {previewing === template.id ? (
                "Generating..."
              ) : (
                <>
                  <Download size={12} /> Preview PDF
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={() => saveTemplate(selected)}
          disabled={isPending || selected === user?.invoiceTemplate}
          className="btn btn-primary"
        >
          {isPending ? (
            "Saving..."
          ) : (
            <>
              <Check size={16} /> Use This Template
            </>
          )}
        </button>
      </div>
    </div>
  );
}
