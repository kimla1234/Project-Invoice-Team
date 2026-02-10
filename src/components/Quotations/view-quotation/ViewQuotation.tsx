// "use client";

// import { useEffect, useState, useRef } from "react";
// import { QuotationData } from "@/types/quotation";
// import html2pdf from "html2pdf.js";
// import { mockClients } from "@/components/Tables/clients";
// import Link from "next/link";
// import { FiSkipBack, FiDownload, FiMail } from "react-icons/fi";
// import { DownloadPDFButton } from "../create-quotation/DownloadPDFButton";
// import { ClientData } from "@/types/client";
// import { sendMessageToTelegram } from "@/utils/telegram";

// interface ViewQuotationProps {
//   id: number;
// }

// const parseNoteOrTerms = (htmlString: string) => {
//   if (!htmlString) return [];
//   const temp = document.createElement("div");
//   temp.innerHTML = htmlString;

//   return Array.from(temp.querySelectorAll("p")).map(
//     (p) => p.textContent?.replace(/^•\s*/, "") || "",
//   ); // Remove existing leading bullet
// };

// export default function ViewQuotation({ id }: ViewQuotationProps) {
//   const [quotation, setQuotation] = useState<QuotationData | null>(null);
//   const [user, setUser] = useState<any>(null);
//   const quotationRef = useRef<HTMLDivElement>(null);
//   const [invoiceNote, setInvoiceNote] = useState("");
//   const [invoiceTerms, setInvoiceTerms] = useState("");
//   const [sending, setSending] = useState(false);
//   useEffect(() => {
//     if (typeof window === "undefined") return; // ensure client-side

//     const stored = localStorage.getItem("invoice_footer_settings");
//     if (stored) {
//       const parsed = JSON.parse(stored);
//       setInvoiceNote(parsed.defaultNote || "");
//       setInvoiceTerms(parsed.defaultTerms || "");
//     }
//   }, []);

//   const noteLines = invoiceNote
//     .split("\n")
//     .filter((line) => line.trim() !== "");

//   const termLines = invoiceTerms
//     .split("\n")
//     .filter((line) => line.trim() !== "");

//   useEffect(() => {
//     // Fetch Quotation
//     const stored = JSON.parse(localStorage.getItem("quotations") || "[]");
//     const found = stored.find((q: QuotationData) => q.id === id);
//     setQuotation(found || null);

//     // Fetch User Info for Header
//     const storedUser = localStorage.getItem("registered_user");
//     if (storedUser) setUser(JSON.parse(storedUser));
//   }, [id]);

//   if (!quotation)
//     return <p className="p-4 text-center">Quotation not found.</p>;

//   const client: ClientData | null =
//     mockClients.find((c) => c.id === quotation.clientId) || null;

//   const handleSend = async () => {
//     if (!quotation) return;
//     setSending(true);

//     const previewLink = `${window.location.origin}/quotation/${quotation.id}`;
//     const message = `📄 Here is your invoice preview: ${previewLink}`;

//     try {
//       const res = await fetch("/api/send-telegram", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message }),
//       });

//       // Debug if HTML returned
//       if (!res.ok) {
//         const text = await res.text();
//         console.error("Unexpected response:", text);
//         alert("Failed to send message. See console.");
//         return;
//       }

//       const data = await res.json();
//       alert("Message sent successfully!");
//       console.log("Telegram response:", data);
//     } catch (err) {
//       console.error("Fetch error:", err);
//       alert("Failed to send message.");
//     } finally {
//       setSending(false);
//     }
//   };


//   return (
//     <div className="flex justify-center space-x-6 p-6">
//       {/* Main Quotation Document */}
//       <div
//         ref={quotationRef}
//         className="w-full max-w-4xl space-y-8 rounded-lg border bg-white p-10"
//       >
//         <header className="flex items-center justify-between">
//           <h1 className="text-4xl font-bold text-gray-800">Quotation</h1>
//           <div className="text-right">
//             <p className="text-sm text-gray-500">Quotation No.</p>
//             <p className="font-semibold text-gray-700">
//               {quotation.quotationNo}
//             </p>
//           </div>
//         </header>

//         {/* Company and Date Details */}
//         <div className="grid gap-6 text-sm text-gray-600 md:grid-cols-3">
//           <div className="border-b pb-6">
//             <p className="text-lg font-bold text-gray-900">
//               {user?.companyName || "Your Company"}
//             </p>
//             <p>{`${user?.houseNo || ""} ${user?.street || ""}`}</p>
//             <p>{`${user?.province || ""}, ${user?.companyPhone || ""}`}</p>
//             <p className="text-gray-500">{user?.companyEmail}</p>
//           </div>

//           <div className="flex justify-end border-b pb-6 md:col-span-2">
//             <div className="grid grid-cols-2 gap-8 text-sm">
//               <div>
//                 <p className="font-bold text-gray-900">Issue Date</p>
//                 <p className="mt-1 text-gray-700">
//                   {new Date(quotation.issueDate).toLocaleDateString("en-GB")}
//                 </p>
//               </div>
//               <div>
//                 <p className="font-bold text-gray-900">Expiry Date</p>
//                 <p className="mt-1 text-gray-500">
//                   {quotation.expiryDate
//                     ? new Date(quotation.expiryDate).toLocaleDateString("en-GB")
//                     : "N/A"}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Client Info Section */}
//         <div className="border-b pb-6 text-sm">
//           <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-medium text-gray-400">
//                 Customer:
//               </span>
//               <span className="font-bold text-gray-900">
//                 {client?.name || "N/A"}
//               </span>
//             </div>
//             <div className="hidden h-4 w-px bg-gray-300 md:block" />
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-medium text-gray-400">
//                 Address:
//               </span>
//               <span className="font-semibold text-gray-700">
//                 {client?.address || "N/A"}
//               </span>
//             </div>
//             <div className="hidden h-4 w-px bg-gray-300 md:block" />
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-medium text-gray-400">Phone:</span>
//               <span className="font-semibold text-gray-700">
//                 {client?.contact || "N/A"}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Items Table */}
//         <div className="overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
//                   No
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
//                   Product Name
//                 </th>
//                 <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
//                   Qty
//                 </th>
//                 <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
//                   Unit Price ($)
//                 </th>
//                 <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
//                   Total ($)
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 bg-white">
//               {(quotation.items ?? []).map((item, index) => (
//                 <tr key={index}>
//                   <td className="px-4 py-3 text-sm text-gray-500">
//                     {index + 1}
//                   </td>
//                   <td className="px-4 py-3 text-sm font-medium text-gray-900">
//                     {item.name}
//                   </td>
//                   <td className="px-4 py-3 text-center text-sm text-gray-900">
//                     {item.qty}
//                   </td>
//                   <td className="px-4 py-3 text-right text-sm text-gray-900">
//                     {(item.unitPrice ?? 0).toFixed(2)}
//                   </td>
//                   <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
//                     {(item.total ?? 0).toFixed(2)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <div className="flex justify-end pt-6">
//             <div className="w-1/2 space-y-3">
//               <div className="flex justify-between font-medium text-gray-600">
//                 <span>Subtotal:</span>
//                 <span>${Number(quotation.amount).toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between text-xl font-bold text-gray-900">
//                 <span>Grand Total:</span>
//                 <span>${Number(quotation.amount).toFixed(2)}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Notes and Terms Section */}
//         {/* Notes and Terms Section */}
//         <div className="mt-8 border-t pt-8">
//           <div className="grid grid-cols-2 gap-8 text-xs text-gray-600">
//             {/* Notes */}
//             <div>
//               <p className="mb-2 font-bold text-gray-800">Note *</p>
//               <ul className="ml-2 list-inside list-disc space-y-1 text-sm text-gray-600">
//                 {parseNoteOrTerms(invoiceNote).map((line, index) => (
//                   <li key={index}>{line}</li>
//                 ))}
//               </ul>
//             </div>

//             <div>
//               <p className="mb-2 font-bold text-gray-800">Terms *</p>
//               <ul className="ml-2 list-inside list-disc space-y-1 text-sm text-gray-600">
//                 {parseNoteOrTerms(invoiceTerms).map((line, index) => (
//                   <li key={index}>{line}</li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>

//         <footer className="pt-12 text-center text-sm text-gray-500">
//           <p>Thank you for choosing {user?.companyName}</p>
//         </footer>
//       </div>

//       {/* Sidebar Actions (Non-printable) */}
//       <div className="no-print sticky top-6 h-fit w-72 space-y-4">
//         <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
//           <Link
//             href="/quotation"
//             className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 p-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
//           >
//             <FiSkipBack /> Back to List
//           </Link>

//           <DownloadPDFButton
//             quotation={{
//               id: quotation.id,
//               quotationNo: quotation.quotationNo,
//               issueDate: quotation.issueDate,
//               expiryDate: quotation.expiryDate,
//               items: quotation.items,
//               clientId: quotation.clientId,
//               amount: quotation.amount,
//               notes: invoiceNote,
//               terms: invoiceTerms,
//             }}
//             client={client}
//             taxRate={0}
//             user={user}
//           />

//           <button
//             onClick={handleSend}
//             disabled={sending}
//             className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 p-3 text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             <FiMail />
//             {sending ? "Sending..." : "Send to Client"}
//           </button>
//         </div>

//         <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
//           <h2 className="mb-2 font-semibold text-gray-800">Quotation Status</h2>
//           <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
//             Active / Saved
//           </span>
//           <p className="mt-4 text-xs text-gray-500">
//             This document is in read-only mode. To make changes, please create a
//             new version.
//           </p>
//         </div>
//       </div>

//       <style jsx global>{`
//         @media print {
//           .no-print {
//             display: none !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }
