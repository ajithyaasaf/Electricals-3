import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BANK_DETAILS } from "@/lib/constants";
import { formatPrice } from "@/lib/currency";
import {
  Copy,
  Check,
  QrCode,
  Smartphone,
  ExternalLink,
  Building,
  ShieldCheck,
  Zap
} from "lucide-react";

interface UpiPaymentCardProps {
  amount: number;
  orderId?: string;
}

export function UpiPaymentCard({ amount, orderId = "ORDER" }: UpiPaymentCardProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const cleanAmount = Math.round(amount || 0).toString();
  // Clean QR URI without am/tn flags for 100% GPay/PhonePe scanner compatibility on personal VPA
  const qrUpiUri = `upi://pay?pa=${BANK_DETAILS.upiId}&pn=${encodeURIComponent(BANK_DETAILS.accountName)}&cu=INR`;
  const mobileUpiUri = `upi://pay?pa=${BANK_DETAILS.upiId}&pn=${encodeURIComponent(BANK_DETAILS.accountName)}&am=${cleanAmount}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUpiUri)}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast({
      title: `${label} Copied!`,
      description: `"${text}" copied to clipboard.`,
    });
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden mb-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
            <h3 className="font-semibold text-base">Quick UPI Payment</h3>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-0 font-normal text-xs">
            0% Fee • Instant
          </Badge>
        </div>
        <p className="text-xs text-blue-100 mt-1">
          Scan QR code or click 1-Tap Pay below to open your preferred UPI app.
        </p>
      </div>

      <div className="p-5 space-y-6">
        {/* QR Code & 1-Tap Mobile Launchers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

          {/* Left Column: QR Code */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="relative group bg-white p-3 rounded-lg shadow-sm border border-slate-200">
              <img
                src={qrCodeUrl}
                alt="Scan UPI QR Code"
                className="w-44 h-44 object-contain rounded"
              />
              <div className="absolute inset-0 bg-blue-900/5 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center pointer-events-none">
                <span className="bg-white/90 text-blue-900 text-xs px-2 py-1 rounded font-medium shadow-sm">
                  Scan to Pay
                </span>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-xs font-semibold text-slate-700 flex items-center justify-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-blue-600" /> Scan with GPay, PhonePe, Paytm
              </p>
              <p className="text-[11px] text-slate-500">
                Amount pre-filled: <span className="font-bold text-blue-700">{formatPrice(amount)}</span>
              </p>
            </div>
          </div>

          {/* Right Column: 1-Tap Mobile UPI Intent Launchers & Quick Copy */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <LabelHeader title="1-Tap Mobile Pay" subtitle="Directly opens payment app with pre-filled details" />

              <div className="grid grid-cols-2 gap-2 mt-2">
                {/* Generic / GPay Launch */}
                <a
                  href={mobileUpiUri}
                  target="_self"
                  className="flex items-center justify-center gap-2 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs shadow-sm transition-all text-center col-span-2 sm:col-span-1"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Open GPay / PhonePe</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                {/* Direct UPI App Intent */}
                <a
                  href={mobileUpiUri}
                  target="_self"
                  className="flex items-center justify-center gap-2 p-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium text-xs shadow-sm transition-all text-center col-span-2 sm:col-span-1"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Any UPI App</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            </div>

            {/* 1-Click Copy UPI ID Row */}
            <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">UPI ID / VPA</span>
                <Badge variant="outline" className="text-[10px] bg-white border-blue-200 text-blue-700">Verified</Badge>
              </div>
              <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border border-blue-200">
                <span className="font-mono text-sm font-semibold text-blue-950 truncate select-all">
                  {BANK_DETAILS.upiId}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-blue-700 hover:bg-blue-50"
                  onClick={() => copyToClipboard(BANK_DETAILS.upiId, "UPI ID")}
                >
                  {copiedField === "UPI ID" ? (
                    <span className="flex items-center text-green-600 font-medium">
                      <Check className="w-3.5 h-3.5 mr-1" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Copy className="w-3.5 h-3.5 mr-1" /> Copy ID
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Copy Amount Row */}
            <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-slate-600">Total Payable Amount:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{formatPrice(amount)}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-[11px]"
                  onClick={() => copyToClipboard(amount.toString(), "Amount")}
                >
                  {copiedField === "Amount" ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-slate-600" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Account Transfer Option */}
        <div className="border-t border-slate-100 pt-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" /> Direct NEFT / RTGS / IMPS Bank Details
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <p className="text-slate-400 text-[10px] uppercase">Bank Name</p>
                <p className="font-medium text-slate-800">{BANK_DETAILS.bankName}</p>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <p className="text-slate-400 text-[10px] uppercase">Account Name</p>
                <p className="font-medium text-slate-800">{BANK_DETAILS.accountName}</p>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase">Account Number</p>
                  <p className="font-mono font-semibold text-slate-900">{BANK_DETAILS.accountNumber}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-slate-500 hover:text-blue-600"
                  onClick={() => copyToClipboard(BANK_DETAILS.accountNumber, "Account Number")}
                >
                  {copiedField === "Account Number" ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase">IFSC Code</p>
                  <p className="font-mono font-semibold text-slate-900">{BANK_DETAILS.ifscCode}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-slate-500 hover:text-blue-600"
                  onClick={() => copyToClipboard(BANK_DETAILS.ifscCode, "IFSC Code")}
                >
                  {copiedField === "IFSC Code" ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Instructions Footer */}
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-emerald-50/70 p-3 rounded-lg border border-emerald-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            After completing payment in your UPI or Bank app, enter the <strong>12-digit UTR/Ref Number</strong> or upload the payment screenshot below to confirm your order.
          </span>
        </div>
      </div>
    </div>
  );
}

function LabelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">{title}</h4>
      <p className="text-[11px] text-slate-500">{subtitle}</p>
    </div>
  );
}
