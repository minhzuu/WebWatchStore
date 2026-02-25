import { toast } from "sonner";
const GUEST_CART_KEY = "guest_cart";

export const getGuestCart = () => {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
};

export const addToGuestCart = (product, quantity = 1) => {
    let cart = getGuestCart();

    // Determine max stock for product (if provided)
    const maxStock = Number.isFinite(product?.stockQuantity)
        ? product.stockQuantity
        : Number.isFinite(product?.stock)
        ? product.stock
        : Infinity;

    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > maxStock) {
            existing.quantity = maxStock;
            toast.error("Không thể thêm vượt quá tồn kho");
        } else {
            existing.quantity = nextQty;
        }
    } else {
        // If initial quantity > stock then cap to stock
        const initialQty = Math.min(quantity, maxStock);
        if (initialQty <= 0) {
            toast.error("Sản phẩm hết hàng");
            return;
        }
        cart.push({
            id: product.id,
            productName: product.name,
            price: product.currentPrice || product.price || 0,
            imageUrl: product.imageUrl || product.primaryImageUrl,
            quantity: initialQty,
            stock: typeof product.stockQuantity !== 'undefined' ? product.stockQuantity : product.stock,
        });
        if (initialQty < quantity) {
            toast.warning("Số lượng đặt bằng số lượng tồn kho");
        }
    }

    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};

export const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
};

export const getGuestCartCount = () => {
  try {
    const cart = JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  } catch (err) {
    return 0;
  }
};
