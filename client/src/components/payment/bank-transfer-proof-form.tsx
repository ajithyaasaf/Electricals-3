import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Import Card etc.
import { Loader2, Upload, FileText, CheckCircle } from "lucide-react";

interface BankTransferProofFormProps {
    orderId: string;
    onSuccess: () => void;
    className?: string; // Allow custom styling
}

export function BankTransferProofForm({ orderId, onSuccess, className }: BankTransferProofFormProps) {
    const { toast } = useToast();
    const [transactionId, setTransactionId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!transactionId) {
            toast({
                title: "Missing Information",
                description: "Please enter the Transaction ID.",
                variant: "destructive"
            });
            return;
        }

        if (!selectedFile) {
            toast({
                title: "Proof Required",
                description: "Please upload a screenshot of your payment.",
                variant: "destructive"
            });
            return;
        }

        try {
            setSubmitting(true);

            // 1. Upload Screenshot
            const formData = new FormData();
            formData.append("image", selectedFile);

            const uploadRes = await apiRequest("POST", "/api/upload/payment-proof", formData);
            const uploadData = await uploadRes.json();

            if (!uploadData.success) {
                throw new Error(uploadData.message || "Image upload failed");
            }

            // 2. Submit Verification
            await apiRequest("POST", `/api/orders/${orderId}/confirm-payment`, {
                transactionId,
                paymentProofUrl: uploadData.url
            });

            toast({
                title: "Proof Submitted!",
                description: "We will verify your payment shortly.",
            });

            onSuccess();
        } catch (error: any) {
            console.error("Payment proof submission error:", error);
            toast({
                title: "Submission Failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="space-y-2">
                <Label htmlFor="txn-id">Transaction ID / UTR Number</Label>
                <Input
                    id="txn-id"
                    placeholder="e.g. UPI1234567890"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    disabled={submitting}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="proof-upload">Upload Screenshot</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="proof-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={submitting}
                        className="flex-1"
                    />
                </div>
                {selectedFile && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Selected: {selectedFile.name}
                    </p>
                )}
            </div>

            <Button
                onClick={handleSubmit}
                disabled={submitting || !transactionId || !selectedFile}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
                {submitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    <>
                        <Upload className="w-4 h-4 mr-2" />
                        Submit Payment Proof
                    </>
                )}
            </Button>
        </div>
    );
}
