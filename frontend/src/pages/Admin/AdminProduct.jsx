import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getPriceRange,
} from "@/api/productAPI";
import { AdminPagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductTable } from "@/components/Admin/products/ProductTable";
import { ProductDetailPanel } from "@/components/Admin/products/ProductDetailPanel";
import { ProductFormDialog } from "@/components/Admin/products/ProductFormDialog";
import { DeleteConfirmDialog } from "@/components/Admin/DeleteConfirmDialog";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { PlusIcon, SearchIcon, Loader2 } from "lucide-react";
import { getBrands } from "@/api/brandAPI";
import { getCategories } from "@/api/categoryAPI";
import { getSuppliers } from "@/api/supplierAPI";

export const AdminProduct = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  // price & status filters
  const PRICE_MAX = 10000000;
  // applied filters used when fetching
  const [appliedMinPrice, setAppliedMinPrice] = useState(0);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(PRICE_MAX);
  // input values (editable by admin) — keep as raw strings so user can clear the field
  const [minPriceInput, setMinPriceInput] = useState(String(appliedMinPrice));
  const [maxPriceInput, setMaxPriceInput] = useState(String(appliedMaxPrice));
  const [priceMaxLimit, setPriceMaxLimit] = useState(PRICE_MAX);
  const [isApplyingPrice, setIsApplyingPrice] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  // filters
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetail, setProductDetail] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    brandId: "",
    categoryId: "",
    supplierId: "",
    stockQuantity: "",
    status: "ACTIVE",
    images: [],
    rating: 0,
    numOfRating: 0,
  });

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return "-";
    // val can be number, string, or BigInt-like; try to coerce
    const num = typeof val === "number" ? val : Number(val);
    if (Number.isNaN(num)) return String(val);
    return num.toLocaleString("vi-VN");
  };

  const fetchProducts = useCallback(async () => {
    try {
      const params = {
        page: page - 1,
        size: 10,
      };

      if (debouncedSearch) params.name = debouncedSearch;
      if (brandFilter) params.brand = brandFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (supplierFilter) params.supplier = supplierFilter;
      // price filters: only send if user narrowed the range
      if (appliedMinPrice > 0) params.minPrice = appliedMinPrice;
      if (appliedMaxPrice < priceMaxLimit) params.maxPrice = appliedMaxPrice;
      if (statusFilter) params.status = statusFilter;

      console.log("[AdminProduct] fetchProducts params:", params);
      const res = await getProducts(params);
      console.log("[AdminProduct] fetchProducts response:", res);
      const content = res?.content ?? res?.data ?? res;
      setProducts(content?.content ?? content ?? []);
      setTotalPages(
        (res && res.totalPages) || (content && content.totalPages) || 0
      );
    } catch (err) {
      console.error("Lỗi khi lấy sản phẩm:", err);
      const status = err?.response?.status;
      if (status === 403) {
        toast.error("Bạn không có quyền xem dữ liệu với bộ lọc này (403).");
      } else if (status === 401) {
        toast.error(
          "Chưa đăng nhập hoặc token hết hạn (401). Vui lòng đăng nhập."
        );
      } else {
        toast.error("Không thể tải danh sách sản phẩm");
      }
    }
  }, [
    page,
    debouncedSearch,
    brandFilter,
    categoryFilter,
    supplierFilter,
    appliedMinPrice,
    appliedMaxPrice,
    priceMaxLimit,
    statusFilter,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // debounce searchTerm
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // auto-apply price inputs (debounced) — applies after admin stops typing for 600ms
  useEffect(() => {
    // when inputs change, show spinner until debounce finishes
    setIsApplyingPrice(true);
    const id = setTimeout(() => {
      const min = Math.max(0, Number(minPriceInput) || 0);
      const max = Math.min(
        priceMaxLimit,
        Number(maxPriceInput) || priceMaxLimit
      );

      if (min > max) {
        // If user swapped values, normalize by swapping them
        setMinPriceInput(max);
        setMaxPriceInput(min);
        setAppliedMinPrice(max);
        setAppliedMaxPrice(min);
      } else {
        setAppliedMinPrice(min);
        setAppliedMaxPrice(max);
      }

      setIsApplyingPrice(false);
      setPage(1);
    }, 600);

    return () => clearTimeout(id);
  }, [minPriceInput, maxPriceInput, priceMaxLimit]);

  // load brands & categories for filter selects
  useEffect(() => {
    let mounted = true;
    const loadMeta = async () => {
      try {
        const [bRes, cRes, sRes] = await Promise.all([
          getBrands(),
          getCategories(),
          getSuppliers(),
        ]);
        if (!mounted) return;
        const normalize = (v) =>
          Array.isArray(v)
            ? v
            : Array.isArray(v?.data)
            ? v.data
            : Array.isArray(v?.content)
            ? v.content
            : [];
        const brandsArray = normalize(bRes);
        // Chỉ lấy brands có status ACTIVE
        const activeBrands = brandsArray.filter((b) => b.status === "ACTIVE");
        setBrands(activeBrands);
        const categoriesArray = normalize(cRes);
        // Chỉ lấy categories có status ACTIVE
        const activeCategories = categoriesArray.filter(
          (cat) => cat.status === "ACTIVE"
        );
        setCategories(activeCategories);
        const suppliersArray = normalize(sRes);
        // Chỉ lấy suppliers có status ACTIVE
        const activeSuppliers = suppliersArray.filter(
          (s) => s.status === "ACTIVE"
        );
        setSuppliers(activeSuppliers);
      } catch (e) {
        console.error("Error loading brands/categories/suppliers", e);
      }
    };
    loadMeta();
    return () => {
      mounted = false;
    };
  }, []);

  // load price range from server (current prices)
  useEffect(() => {
    let mounted = true;
    const loadRange = async () => {
      try {
        const range = await getPriceRange();
        if (!mounted || !range) return;
        const max = Number(range.maxPrice) || PRICE_MAX;
        const min = Number(range.minPrice) || 0;
        setPriceMaxLimit(max);
        setAppliedMaxPrice(max);
        setAppliedMinPrice(min);
        setMaxPriceInput(String(max));
        setMinPriceInput(min === 0 ? "" : String(min));
      } catch (e) {
        console.error("Error loading price range", e);
      }
    };
    loadRange();
    return () => {
      mounted = false;
    };
  }, []);

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const fetchProductDetail = useCallback(async (productId) => {
    try {
      const res = await getProductById(productId);
      console.log("[AdminProduct] Product detail response:", res);
      console.log("[AdminProduct] Category:", res.category);
      console.log("[AdminProduct] Supplier:", res.supplier);
      setProductDetail(res);
      setSelectedProduct(res);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", err);
      toast.error("Không thể tải chi tiết sản phẩm");
    }
  }, []);

  const handleRowClick = (product) => {
    fetchProductDetail(product.id);
  };

  const handleCloseDetail = () => {
    setProductDetail(null);
    setSelectedProduct(null);
  };

  const handleEdit = async (product) => {
    try {
      // Lấy thông tin chi tiết từ API
      const fullProduct = await getProductById(product.id);
      setSelectedProduct(fullProduct);

      // Lấy giá hiện tại từ productPrices hoặc price field
      const currentPrice =
        fullProduct.price ||
        fullProduct.productPrices?.find((p) => p.isCurrent)?.price ||
        fullProduct.productPrices?.[0]?.price ||
        "";

      // Lấy số lượng tồn kho
      const stockQuantity =
        fullProduct.stockQuantity || fullProduct.inventories?.[0]?.stock || "";

      setFormData({
        name: fullProduct.name,
        description: fullProduct.description || "",
        status: fullProduct.status || "ACTIVE",
        brandId: String(fullProduct.brandId || ""),
        categoryId: String(fullProduct.categoryId || ""),
        supplierId: String(fullProduct.supplierId || ""),
        price: currentPrice,
        stockQuantity: stockQuantity,
        images: fullProduct.productImages || [],
        productSpecs: Array.isArray(fullProduct.productSpecs)
          ? fullProduct.productSpecs.map((s) => ({
              name: s.keyName || s.name,
              value: s.value,
            }))
          : [],
      });
      setIsEditOpen(true);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin sản phẩm:", err);
      toast.error("Không thể tải thông tin sản phẩm");
    }
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const handleAddNew = () => {
    setFormData({
      name: "",
      description: "",
      status: "ACTIVE",
      brandId: "",
      categoryId: "",
      supplierId: "",
      price: "",
      stockQuantity: "",
      images: [],
      productSpecs: [],
    });
    setIsAddOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitAdd = async (e, images = []) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        images,
      };

      await createProduct(productData);
      toast.success("Thêm sản phẩm thành công");
      setIsAddOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Lỗi khi thêm sản phẩm:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Không thể thêm sản phẩm";

      if (err.response?.status === 403) {
        toast.error(
          "Bạn không có quyền thêm sản phẩm. Vui lòng đăng nhập với tài khoản ADMIN."
        );
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleSubmitEdit = async (e, images = []) => {
    e.preventDefault();
    try {
      // Transform images: nếu có upload mới thì dùng, không thì dùng images cũ
      let imagesToSend = images.length > 0 ? images : formData.images;

      // Transform formData.images từ backend format sang request format
      if (imagesToSend && imagesToSend.length > 0) {
        imagesToSend = imagesToSend.map((img) => ({
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary || false,
        }));
      }

      const productData = {
        ...formData,
        images: imagesToSend,
      };

      console.log("=== UPDATING PRODUCT ===");
      console.log("Product ID:", selectedProduct.id);
      console.log("Product data:", productData);

      await updateProduct(selectedProduct.id, productData);
      toast.success("Cập nhật sản phẩm thành công");
      setIsEditOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Lỗi khi cập nhật sản phẩm:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Không thể cập nhật sản phẩm";
      toast.error(errorMsg);
    }
  };

  const confirmDelete = async () => {
    try {
      // Xóa mềm: đổi status sang DISCONTINUED (ngừng bán vĩnh viễn), không xóa ảnh
      await deleteProduct(selectedProduct.id);
      toast.success("Đã ngừng bán sản phẩm");
      setIsDeleteOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Lỗi khi ngừng bán sản phẩm:", err);
      toast.error("Không thể ngừng bán sản phẩm");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý Sản phẩm
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý danh sách sản phẩm trong cửa hàng
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-brand-primary text-white px-4 py-2 rounded hover:bg-brand-primary-soft cursor-pointer"
        >
          <PlusIcon className="size-4" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-end gap-3 mt-3">
        <div className="min-w-40">
          <label className="block text-xs text-gray-500 mb-1">
            Thương hiệu
          </label>
          <select
            value={brandFilter}
            onChange={(e) => {
              console.log("[AdminProduct] brand selected", e.target.value);
              setBrandFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded border border-border px-3 py-2 bg-white"
          >
            <option value="">Tất cả</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-40">
          <label className="block text-xs text-gray-500 mb-1">Danh mục</label>
          <select
            value={categoryFilter}
            onChange={(e) => {
              console.log("[AdminProduct] category selected", e.target.value);
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded border border-border px-3 py-2 bg-white"
          >
            <option value="">Tất cả</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-40">
          <label className="block text-xs text-gray-500 mb-1">
            Nhà cung cấp
          </label>
          <select
            value={supplierFilter}
            onChange={(e) => {
              console.log("[AdminProduct] supplier selected", e.target.value);
              setSupplierFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded border border-border px-3 py-2 bg-white"
          >
            <option value="">Tất cả</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="min-w-40">
          <label className="block text-xs text-gray-500 mb-1">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded border border-border px-3 py-2 bg-white"
          >
            <option value="">Tất cả</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Tạm ngưng</option>
            <option value="DISCONTINUED">Ngừng bán</option>
            <option value="OUT_OF_STOCK">Hết hàng</option>
          </select>
        </div>

        {/* Price filter: precise inputs (auto-apply, debounced) */}
        <div className="min-w-64 w-72">
          <label className="block text-xs text-gray-500 mb-1">Giá (₫)</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              step={1000}
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="w-1/2"
              placeholder="Min"
            />
            <Input
              type="number"
              min={0}
              step={1000}
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="w-1/2"
              placeholder="Max"
            />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
          {isApplyingPrice && (
            <Loader2 className="size-4 animate-spin text-gray-400" />
          )}
          <div>
            Đang lọc: {formatCurrency(appliedMinPrice)} —{" "}
            {formatCurrency(appliedMaxPrice)} ₫
          </div>
        </div>

        <div className="ml-auto flex items-end gap-2">
          <Button
            onClick={() => {
              setBrandFilter("");
              setCategoryFilter("");
              setSupplierFilter("");
              setAppliedMinPrice(0);
              setAppliedMaxPrice(priceMaxLimit);
              setMinPriceInput("");
              setMaxPriceInput(String(priceMaxLimit));
              setStatusFilter("ACTIVE");
              setSearchTerm("");
              setPage(1);
            }}
            className="cursor-pointer px-3 py-2"
          >
            Clear filters
          </Button>
        </div>
      </div>

      {/* Product Table */}
      <div>
        <ProductTable
          products={products}
          selectedProduct={selectedProduct}
          onRowClick={handleRowClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          formatCurrency={formatCurrency}
        />

        {/* Pagination */}
        <div className="mt-4">
          <AdminPagination
            handleNext={handleNext}
            handlePrev={handlePrev}
            handlePageChange={handlePageChange}
            page={page}
            totalPages={totalPages}
          />
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailPanel
        productDetail={productDetail}
        onClose={handleCloseDetail}
      />

      {/* Add Dialog */}
      <ProductFormDialog
        isOpen={isAddOpen}
        onClose={setIsAddOpen}
        mode="add"
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleSubmitAdd}
        onSubmitWithImages={handleSubmitAdd}
      />

      {/* Edit Dialog */}
      <ProductFormDialog
        isOpen={isEditOpen}
        onClose={setIsEditOpen}
        mode="edit"
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleSubmitEdit}
        onSubmitWithImages={handleSubmitEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        itemName={selectedProduct?.name}
        onConfirm={confirmDelete}
        title="Xác nhận xóa sản phẩm"
      />
    </div>
  );
};
