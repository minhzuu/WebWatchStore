import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Admin } from "./pages/Admin";
import { AdminPromotions } from "./pages/Admin/AdminPromotions";
import { AdminUser } from "./pages/Admin/AdminUser";
import { AdminDashboard } from "./pages/Admin/AdminDashboard";
import { AdminMethodPayments } from "./pages/Admin/AdminMethodPayments";
import { AdminInvoice } from "./pages/Admin/AdminInvoice";
import { AdminOrders } from "./pages/Admin/AdminOrders";
import { AdminProduct } from "./pages/Admin/AdminProduct";
import { AdminSettings } from "./pages/Admin/AdminSettings";
import { AdminProductStock } from "./pages/Admin/AdminProductStock";
import { AdminReview } from "./pages/Admin/AdminReview";
import { AdminViewReport } from "./pages/Admin/AdminViewReport";
import { Dashboard } from "./pages/Dashboard";
import { AdminBanner } from "./pages/Admin/AdminBanner";
import { default as Login, default as LoginRegister } from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { User } from "./pages/User";
import ChangePassword from "./pages/ChangePassword";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import Cart from "@/pages/Cart.jsx";
import { AdminCategories } from "./pages/Admin/AdminCategories";
import { AdminBrands } from "./pages/Admin/AdminBrands";
import { AdminSuppliers } from "./pages/Admin/AdminSuppliers";
import ProductDetail from "./pages/ProductDetail";
import { Home } from "./pages/Home";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import ProductList from "./pages/ProductList";
import PromotionalProducts from "./pages/PromotionalProducts";
import { AdminPostCategory } from "./pages/Admin/AdminPostCategory";
import { AdminPosts } from "./pages/Admin/AdminPosts";
import Wishlist from "./pages/Wishlist";
import PostList from "./pages/PostList";
import AdminChat from "./pages/Admin/AdminChat";
import { ChatProvider } from "./contexts/ChatContext";
import ChatWidget from "./components/ChatWidget";
import AIChatWidget from "./components/AIChat/AIChatWidget";
import Support from "./pages/Support";
import About from "./pages/About";
import VNPayReturn from "./pages/VNPayReturn";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <ChatProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/change-password"
            element={
              <PrivateRoute>
                <ChangePassword />
              </PrivateRoute>
            }
          />
          <Route path="/products" element={<ProductList />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/promotional-products"
            element={<PromotionalProducts />}
          />
          <Route path="/posts" element={<PostList />} />
          <Route path="/posts/:categorySlug" element={<PostList />} />
          <Route path="/posts/:categorySlug/:postSlug" element={<PostList />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Private */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={["ADMIN"]}>
                <Admin />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProduct />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="suppliers" element={<AdminSuppliers />} />
            <Route path="banners" element={<AdminBanner />} />
            <Route path="post-categories" element={<AdminPostCategory />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="stock" element={<AdminProductStock />} />
            <Route path="payments" element={<AdminMethodPayments />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="reviews" element={<AdminReview />} />
            <Route path="users" element={<AdminUser />} />
            <Route path="invoice" element={<AdminInvoice />} />
            <Route path="reports" element={<AdminViewReport />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="chat" element={<AdminChat />} />
          </Route>

          {/* User routes */}
          <Route path="cart" element={<Cart />} />
          <Route
            path="/support"
            element={
              <PrivateRoute>
                <Support />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <User />
              </PrivateRoute>
            }
          />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/payment/vnpay-return" element={<VNPayReturn />} />
          {/* Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIChatWidget />
        <ChatWidget />
      </Router>
    </ChatProvider>
  );
}

export default App;
