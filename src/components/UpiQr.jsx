// components/UpiQr.jsx

import React, { useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";


import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const UpiQr = ({ upiId, payeeName, amount }) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const navigate = useNavigate();

  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&cu=INR`;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      toast.success("Thank you! Redirecting to orders...");
      // Optionally: call backend here to mark payment pending
      navigate("/orders");
    } catch {
      toast.error("Failed to confirm, try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3 p-4 bg-emerald-50 rounded-xl">
      <h3 className="text-lg font-semibold text-center">
        Scan & Pay ₹{amount} via UPI
      </h3>
      <QRCodeSVG value={upiUrl} size={200} />
      <p className="text-sm text-gray-600 text-center">
        UPI ID: {upiId}
        <br />
        Payee: {payeeName}
      </p>
     
    </div>
  );
};

export default UpiQr;
