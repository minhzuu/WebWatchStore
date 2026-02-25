import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { handleVNPayReturn } from "../api/paymentAPI";
import { removeCartItem } from "../api/cartAPI";
import { toast } from "sonner";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function VNPayReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Prevent double execution
    let isProcessing = false;
    
    const processPaymentReturn = async () => {
      if (isProcessing) return;
      isProcessing = true;
      
      try {
        // Convert URLSearchParams to object
        const params = {};
        for (const [key, value] of searchParams.entries()) {
          params[key] = value;
        }

        console.log("VNPay return params:", params);

        // Call API to verify payment (only once)
        const response = await handleVNPayReturn(params);
        console.log("VNPay verification response:", response);

        setResult(response);
        setProcessing(false);

        // If payment successful
        if (response?.code === "00") {
          toast.success("Thanh toán thành công!");
          
          // Clean up sessionStorage
          sessionStorage.removeItem('vnpay_cart_items');
          // Note: Backend already cleared cart items when creating the order
          // No need to call removeCartItem API here

          // Redirect to orders page after 2 seconds
          setTimeout(() => {
            navigate("/orders", {
              state: {
                orderId: response?.orderId,
                message: "Đơn hàng đã được thanh toán thành công qua VNPay"
              }
            });
          }, 2000);
        } else {
          // Payment failed
          toast.error("Thanh toán thất bại: " + (response?.message || "Vui lòng thử lại"));
          
          // Redirect to cart after 3 seconds
          setTimeout(() => {
            navigate("/cart");
          }, 3000);
        }

      } catch (error) {
        console.error("Error processing VNPay return:", error);
        setProcessing(false);
        toast.error("Có lỗi xảy ra khi xử lý thanh toán");
        
        setTimeout(() => {
          navigate("/cart");
        }, 3000);
      }
    };

    processPaymentReturn();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          {processing ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">Đang xử lý thanh toán...</h2>
              <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
            </div>
          ) : result?.code === "00" ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h2>
              <p className="text-gray-600 mb-4">Đơn hàng của bạn đã được thanh toán thành công</p>
              <div className="bg-gray-50 rounded p-4 text-left text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-semibold">#{result?.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã giao dịch:</span>
                  <span className="font-semibold">{result?.vnp_TransactionNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-red-600">
                    {result?.vnp_Amount ? (parseInt(result.vnp_Amount) / 100).toLocaleString() : "0"}đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="font-semibold">{result?.vnp_BankCode || "N/A"}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">Đang chuyển đến trang đơn hàng...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Thanh toán thất bại</h2>
              <p className="text-gray-600 mb-4">{result?.message || "Đã có lỗi xảy ra trong quá trình thanh toán"}</p>
              <p className="text-sm text-gray-500">Đang chuyển về giỏ hàng...</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
