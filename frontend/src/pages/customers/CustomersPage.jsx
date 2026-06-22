import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Users,
  Search,
  Plus,
  X,
  Phone,
  Mail,
  Building2,
  Upload,
  Download,
  CheckCircle,
} from "lucide-react";
import { customerAPI } from "../../services/api.js";
import { fmt, getInitials, avatarColor } from "../../utils/helpers.js";
import toast from "react-hot-toast";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const qc = useQueryClient();
  const [showImport, setShowImport] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [csvError, setCsvError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const { mutate: importCustomers } = useMutation({
    mutationFn: customerAPI.import,
    onSuccess: (res) => {
      setImportResult(res.data);
      qc.invalidateQueries(["customers"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Import failed"),
  });

  const handleVCFUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const contacts = [];
        const vcards = text.split("BEGIN:VCARD").filter((v) => v.trim());

        vcards.forEach((vcard) => {
          const getName = () => {
            const fn = vcard.match(/FN[^:]*:(.+)/i);
            const n = vcard.match(/N[^:]*:(.+)/i);
            if (fn) return fn[1].trim();
            if (n) {
              const parts = n[1]
                .split(";")
                .map((p) => p.trim())
                .filter(Boolean);
              return parts.reverse().join(" ").trim();
            }
            return "";
          };

          const getPhone = () => {
            const phones = vcard.match(/TEL[^:]*:(.+)/gi);
            if (!phones) return "";
            return phones[0]
              .replace(/TEL[^:]*:/i, "")
              .trim()
              .replace(/\s/g, "");
          };

          const getEmail = () => {
            const email = vcard.match(/EMAIL[^:]*:(.+)/i);
            return email ? email[1].trim() : "";
          };

          const getOrg = () => {
            const org = vcard.match(/ORG[^:]*:(.+)/i);
            return org ? org[1].trim() : "";
          };

          const name = getName();
          const phone = getPhone();

          if (name || phone) {
            contacts.push({
              name,
              phone,
              email: getEmail(),
              businessName: getOrg(),
            });
          }
        });

        if (contacts.length === 0) {
          setCsvError("No contacts found in VCF file");
          setCsvData([]);
          return;
        }

        setCsvData(contacts);
        setCsvError("");
        toast.success(`Found ${contacts.length} contacts!`);
      } catch (err) {
        setCsvError("Failed to parse VCF file");
        setCsvData([]);
      }
    };
    reader.readAsText(file);
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith(".vcf")) {
      handleVCFUpload(file);
      return;
    }

    if (!file.name.endsWith(".csv"))
      return toast.error("Please upload a .csv or .vcf file");

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const lines = text.split("\n").filter((l) => l.trim());
        const headers = lines[0]
          .toLowerCase()
          .split(",")
          .map((h) => h.trim().replace(/"/g, ""));

        const nameIdx = headers.findIndex((h) => h.includes("name"));
        const phoneIdx = headers.findIndex(
          (h) => h.includes("phone") || h.includes("mobile"),
        );
        const emailIdx = headers.findIndex((h) => h.includes("email"));
        const bizIdx = headers.findIndex((h) => h.includes("business"));

        if (nameIdx === -1 || phoneIdx === -1) {
          setCsvError('CSV must have "name" and "phone" columns');
          setCsvData([]);
          return;
        }

        const rows = lines
          .slice(1)
          .map((line) => {
            const cols = line.split(",").map((c) => c.trim().replace(/"/g, ""));
            return {
              name: cols[nameIdx] || "",
              phone: cols[phoneIdx] || "",
              email: emailIdx !== -1 ? cols[emailIdx] || "" : "",
              businessName: bizIdx !== -1 ? cols[bizIdx] || "" : "",
            };
          })
          .filter((r) => r.name || r.phone);

        setCsvData(rows);
        setCsvError("");
      } catch (err) {
        setCsvError("Failed to parse CSV file");
        setCsvData([]);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvData.length) return toast.error("No data to import");
    setImporting(true);
    try {
      const res = await customerAPI.import({ customers: csvData });
      setImportResult(res.data);
      qc.invalidateQueries(["customers"]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerAPI.getAll().then((r) => r.data),
  });
  const customers = (data?.customers || []).filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search),
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { mutate: create, isPending } = useMutation({
    mutationFn: customerAPI.create,
    onSuccess: () => {
      toast.success("Customer added!");
      qc.invalidateQueries(["customers"]);
      setShowModal(false);
      reset();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="section-header">
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="btn btn-ghost flex-shrink-0 border border-dark-200 dark:border-gray-700 btn-sm"
          >
            <Upload size={16} /> Import CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex-shrink-0 btn-sm"
          >
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="input pl-10"
        />
      </div>
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="empty-state p-10">
            <Users size={48} className="text-dark-200" />
            <p className="font-semibold text-dark dark:text-white">
              No customers yet
            </p>
            <button
              onClick={() => setShowImport(true)}
              className="btn btn-ghost border border-dark-200 dark:border-gray-700 btn-sm"
            >
              <Upload size={16} /> Import CSV
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary btn-sm mt-2"
            >
              <Plus size={16} />
              Add Customer
            </button>
          </div>
        ) : (
          <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
            {customers.map((c) => (
              <Link
                key={c._id}
                to={`/dashboard/customers/${c._id}`}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group"
              >
                <div
                  className={`avatar w-11 h-11 text-sm flex-shrink-0 ${avatarColor(c.name || "")}`}
                >
                  {getInitials(c.name || "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-dark dark:text-white">
                    {c.name}
                  </p>
                  <p className="text-xs text-dark-400">
                    {c.phone} · {c.totalInvoices || 0} invoices
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-dark dark:text-white text-sm">
                    {fmt.naira(c.totalSpent)}
                  </p>
                  {c.outstandingBalance > 0 && (
                    <p className="text-xs text-danger font-medium">
                      Owes {fmt.naira(c.outstandingBalance)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="font-bold text-dark dark:text-white">
                Add Customer
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-ghost p-2"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleSubmit(create)}
              className="modal-body space-y-4"
            >
              <div>
                <label className="input-label">Full Name *</label>
                <div className="relative">
                  <Users
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"
                  />
                  <input
                    {...register("name", { required: true })}
                    placeholder="Customer name"
                    className={`input pl-9 ${errors.name ? "border-danger" : ""}`}
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Phone Number *</label>
                <div className="relative">
                  <Phone
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"
                  />
                  <input
                    {...register("phone", { required: true })}
                    placeholder="+234 800 000 0000"
                    className={`input pl-9 ${errors.phone ? "border-danger" : ""}`}
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Email (optional)</label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"
                  />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="customer@email.com"
                    className="input pl-9"
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Business Name (optional)</label>
                <div className="relative">
                  <Building2
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"
                  />
                  <input
                    {...register("businessName")}
                    placeholder="Business name"
                    className="input pl-9"
                  />
                </div>
              </div>
            </form>
            <div className="modal-footer">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit(create)}
                disabled={isPending}
                className="btn btn-primary"
              >
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Add Customer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-surface">
              <div>
                <h3 className="font-bold text-dark dark:text-white">
                  Import Customers from CSV
                </h3>
                <p className="text-xs text-dark-400">
                  Upload a spreadsheet to bulk add customers
                </p>
              </div>
              <button
                onClick={() => {
                  setShowImport(false);
                  setCsvData([]);
                  setImportResult(null);
                  setCsvError("");
                }}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {importResult ? (
                // Results screen
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={32} className="text-success" />
                  </div>
                  <h3 className="font-bold text-dark dark:text-white">
                    Import Complete!
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-success-light rounded-xl">
                      <p className="text-2xl font-black text-success">
                        {importResult.imported}
                      </p>
                      <p className="text-xs text-dark-400">Imported</p>
                    </div>
                    <div className="p-3 bg-warning-light rounded-xl">
                      <p className="text-2xl font-black text-warning">
                        {importResult.skipped}
                      </p>
                      <p className="text-xs text-dark-400">Skipped</p>
                    </div>
                  </div>
                  {importResult.errors?.length > 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-dark rounded-xl text-left max-h-32 overflow-y-auto">
                      <p className="text-xs font-semibold text-dark-400 mb-1">
                        Details:
                      </p>
                      {importResult.errors.map((e, i) => (
                        <p key={i} className="text-xs text-dark-400">
                          {e}
                        </p>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setShowImport(false);
                      setCsvData([]);
                      setImportResult(null);
                    }}
                    className="btn btn-primary w-full"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* CSV format guide */}
                  <div className="p-3 bg-primary-light dark:bg-primary/10 rounded-xl">
                    <p className="text-xs font-semibold text-primary mb-2">
                      📋 Supported formats:
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs text-dark-500">
                        <strong>.csv</strong> — from Excel or Google Sheets
                      </p>
                      <p className="text-xs text-dark-500">
                        <strong>.vcf</strong> — from phone contacts
                        (Android/iPhone)
                      </p>
                    </div>
                    <p className="text-xs text-dark-400 mt-2">
                      Export from Google Contacts →{" "}
                      <strong>contacts.google.com</strong> → Export
                    </p>
                  </div>

                  {/* Download template */}
                  <button
                    onClick={() => {
                      const csv =
                        "name,phone,email,businessName\nAmaka Obi,08012345678,amaka@gmail.com,Amaka Fashion\nJohn Doe,08098765432,,";
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "trackeet-customers-template.csv";
                      a.click();
                    }}
                    className="btn btn-ghost border border-dark-200 dark:border-gray-700 btn-sm w-full"
                  >
                    <Download size={14} /> Download CSV Template
                  </button>

                  {/* Upload area */}
                  <div
                    onClick={() =>
                      document.getElementById("csv-upload").click()
                    }
                    className="border-2 border-dashed border-dark-200 dark:border-gray-600 rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary-light/20 transition-all"
                  >
                    <Upload size={32} className="text-dark-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-dark dark:text-white">
                      Click to upload CSV or VCF file
                    </p>
                    <p className="text-xs text-dark-400 mt-1">
                      CSV from Excel · VCF from phone contacts
                    </p>
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv,.vcf"
                      className="hidden"
                      onChange={handleCSVUpload}
                    />
                  </div>

                  {csvError && (
                    <div className="p-3 bg-danger-light rounded-xl">
                      <p className="text-xs text-danger font-semibold">
                        {csvError}
                      </p>
                    </div>
                  )}

                  {/* Preview */}
                  {csvData.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-dark dark:text-white mb-2">
                        Preview — {csvData.length} customers found
                      </p>
                      <div className="max-h-48 overflow-y-auto border border-dark-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-dark">
                              <th className="text-left p-2 text-dark-400">
                                Name
                              </th>
                              <th className="text-left p-2 text-dark-400">
                                Phone
                              </th>
                              <th className="text-left p-2 text-dark-400">
                                Email
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-dark-100 dark:divide-gray-700">
                            {csvData.slice(0, 10).map((row, i) => (
                              <tr key={i}>
                                <td className="p-2 text-dark dark:text-white font-semibold">
                                  {row.name || "—"}
                                </td>
                                <td className="p-2 text-dark-400">
                                  {row.phone || "—"}
                                </td>
                                <td className="p-2 text-dark-400">
                                  {row.email || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {csvData.length > 10 && (
                          <p className="text-xs text-dark-400 text-center p-2">
                            +{csvData.length - 10} more customers
                          </p>
                        )}
                      </div>

                      <button
                        onClick={handleImport}
                        disabled={importing}
                        className="btn btn-primary w-full mt-3 py-3"
                      >
                        {importing ? (
                          "Importing..."
                        ) : (
                          <>
                            <Upload size={16} /> Import {csvData.length}{" "}
                            Customers
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
