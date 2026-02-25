export const PAYMENT_METHOD_LABELS = {
    CASH: "Tiền mặt",
    BANK_TRANSFER: "Chuyển khoản ngân hàng",
    CREDIT_CARD: "Thẻ tín dụng",
    DEBIT_CARD: "Thẻ ghi nợ",
    MOMO: "Ví MoMo",
    ZALOPAY: "Ví ZaloPay",
    VNPAY: "VNPay",
    SHOPEEPAY: "ShopeePay",
};

export const getPaymentMethodLabel = (method) =>
    method ? PAYMENT_METHOD_LABELS[method] ?? method : "--";
