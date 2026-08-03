import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

interface BankTransferProofFormProps {
  orderId: string;
  onSuccess: () => void;
  className?: string;
}

export function BankTransferProofForm({ orderId, onSuccess, className }: BankTransferProofFormProps) {
  const { toast } = useToast();
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!orderId || orderId === "undefined") {
      toast({
        title: "Order ID Missing",
        description: "Please view your order from Your Account > Orders to confirm payment.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Submit 1-Click Payment Confirmation (transactionId is optional)
      await apiRequest("POST", `/api/orders/${orderId}/confirm-payment`, {
        transactionId: transactionId.trim() || undefined,
      });

      toast({
        title: "Payment Confirmation Submitted!",
        description: "Thank you. Our team is verifying your payment with your bank transfer.",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Payment confirmation error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`bg-emerald-50/80 p-5 rounded-xl border border-emerald-200 space-y-4 shadow-sm ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h4 className="font-semibold text-emerald-950 text-sm">Have you completed the payment?</h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            Click below to notify us. Our team will verify the transfer in our bank statement and confirm your order.
          </p>
        </div>
      </div>

      {/* Optional UTR / Reference Number Field */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-xs">
          <Label htmlFor="txn-id" className="text-emerald-900 font-medium">
            UPI UTR / Reference Number
          </Label>
          <span className="text-[11px] text-emerald-600 bg-white/80 px-1.5 py-0.5 rounded border border-emerald-200">
            Optional
          </span>
        </div>
        <Input
          id="txn-id"
          placeholder="e.g. 321456789012 (Optional)"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          disabled={submitting}
          className="bg-white border-emerald-200 focus:ring-emerald-500 text-xs h-9"
        />
      </div>

      {/* 1-Click Action Button */}
      <Button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-2.5 shadow-sm transition-all flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting Confirmation...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>I Have Completed Payment</span>
            <ArrowRight className="w-4 h-4 opacity-80" />
          </>
        )}
      </Button>
    </div>
  );
}
