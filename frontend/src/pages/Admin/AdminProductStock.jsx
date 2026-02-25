import React, { useState, useEffect } from "react";
import { getProducts } from "@/api/productAPI";
import { updateInventoryStock } from "@/api/inventoryAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Package, 
  Search, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Boxes,
  ShieldAlert,
  Edit
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { parseStoredUser } from "@/utils/storage";

export const AdminProductStock = () => {
  const navigate = useNavigate();
  const user = parseStoredUser();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState(""); // "", "LOW", "OUT"
  const [hasError, setHasError] = useState(false);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newStock, setNewStock] = useState("");
  const [updateReason, setUpdateReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  const pageSize = 15;

  // Check authentication and authorization
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || !user) {
      toast.error("Vui lòng đăng nhập để tiếp tục");
      navigate("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      toast.error("Bạn không có quyền truy cập trang này");
      navigate("/");
      return;
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setHasError(false);
      
      const params = {
        page: currentPage,
        size: pageSize,
        name: searchTerm,
        sortBy: "id", // Sort by id instead of stockQuantity (since it's computed)
        order: "desc",
      };

      const response = await getProducts(params);
      let allProducts = response.content || [];

      // Lọc theo trạng thái tồn kho
      if (filterStatus === "OUT") {
        allProducts = allProducts.filter(p => (p.stockQuantity || 0) === 0);
      } else if (filterStatus === "LOW") {
        allProducts = allProducts.filter(p => {
          const stock = p.stockQuantity || 0;
          return stock > 0 && stock <= 10;
        });
      }

      // Sort by stockQuantity (low to high) after fetching
      const sortedProducts = [...allProducts].sort((a, b) => {
        const stockA = a.stockQuantity || 0;
        const stockB = b.stockQuantity || 0;
        return stockA - stockB; // Ascending order (lowest stock first)
      });

      setProducts(sortedProducts);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
      setHasError(true);
      
      if (error.response?.status === 403) {
        toast.error("Bạn không có quyền truy cập. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          navigate("/login");
        }, 2000);
      } else if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          navigate("/login");
        }, 2000);
      } else {
        toast.error("Không thể tải danh sách sản phẩm");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditStock = (product) => {
    setEditingProduct(product);
    setNewStock(product.stockQuantity?.toString() || "0");
    setUpdateReason("");
    setEditDialogOpen(true);
  };

  const handleUpdateStock = async () => {
    if (!editingProduct) return;

    const stockValue = parseInt(newStock);
    if (isNaN(stockValue) || stockValue < 0) {
      toast.error("Số lượng không hợp lệ");
      return;
    }

    setIsUpdating(true);
    try {
      // Check if product has inventories
      if (!editingProduct.inventories || editingProduct.inventories.length === 0) {
        toast.error("Sản phẩm này chưa có inventory. Vui lòng tạo inventory trước.");
        console.error("Product data:", editingProduct);
        setIsUpdating(false);
        return;
      }

      // Get first inventory of the product
      const inventoryId = editingProduct.inventories[0].id;
      console.log("Updating inventory:", inventoryId, "to stock:", stockValue);

      await updateInventoryStock(inventoryId, stockValue, updateReason);
      
      toast.success(`Đã cập nhật số lượng tồn kho thành ${stockValue}`);
      setEditDialogOpen(false);
      fetchProducts(); // Reload data
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật số lượng tồn kho");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0 || stock === null || stock === undefined) {
      return {
        label: "Hết hàng",
        variant: "destructive",
        icon: XCircle,
        color: "text-red-500",
      };
    } else if (stock <= 10) {
      return {
        label: "Sắp hết",
        variant: "warning",
        icon: AlertTriangle,
        color: "text-yellow-500",
      };
    } else if (stock <= 50) {
      return {
        label: "Ổn định",
        variant: "default",
        icon: TrendingDown,
        color: "text-blue-500",
      };
    } else {
      return {
        label: "Dồi dào",
        variant: "success",
        icon: TrendingUp,
        color: "text-green-500",
      };
    }
  };

  const stats = {
    total: products.length,
    outOfStock: products.filter(p => (p.stockQuantity || 0) === 0).length,
    lowStock: products.filter(p => {
      const stock = p.stockQuantity || 0;
      return stock > 0 && stock <= 10;
    }).length,
    inStock: products.filter(p => (p.stockQuantity || 0) > 10).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Boxes className="size-8 text-brand-primary" />
            Quản Lý Tồn Kho
          </h1>
          <p className="text-gray-500 mt-1">
            Theo dõi và quản lý tồn kho sản phẩm
          </p>
        </div>
        <Button
          onClick={() => fetchProducts()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="size-4" />
          Làm mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Package className="size-4" />
              Tổng sản phẩm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-red-700">
              <XCircle className="size-4" />
              Hết hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{stats.outOfStock}</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="size-4" />
              Sắp hết
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{stats.lowStock}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="size-4" />
              Còn hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{stats.inStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0);
                }}
                className="pl-10"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "" ? "default" : "outline"}
                onClick={() => {
                  setFilterStatus("");
                  setCurrentPage(0);
                }}
              >
                Tất cả
              </Button>
              <Button
                variant={filterStatus === "OUT" ? "destructive" : "outline"}
                onClick={() => {
                  setFilterStatus("OUT");
                  setCurrentPage(0);
                }}
              >
                Hết hàng
              </Button>
              <Button
                variant={filterStatus === "LOW" ? "warning" : "outline"}
                onClick={() => {
                  setFilterStatus("LOW");
                  setCurrentPage(0);
                }}
                className={filterStatus === "LOW" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              >
                Sắp hết
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm</CardTitle>
          <CardDescription>
            Hiển thị {products.length} sản phẩm
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
              <span className="ml-3 text-gray-500">Đang tải...</span>
            </div>
          ) : hasError ? (
            <div className="text-center py-12">
              <ShieldAlert className="size-12 text-red-500 mx-auto mb-3" />
              <p className="text-gray-700 font-semibold mb-2">Không thể tải dữ liệu</p>
              <p className="text-gray-500 text-sm mb-4">
                Vui lòng kiểm tra quyền truy cập hoặc đăng nhập lại
              </p>
              <Button onClick={() => navigate("/login")} variant="outline">
                Đăng nhập lại
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="size-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">ID</TableHead>
                      <TableHead className="w-24">Ảnh</TableHead>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead>Thương hiệu</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead className="text-center">Số lượng</TableHead>
                      <TableHead className="text-center">Trạng thái</TableHead>
                      <TableHead className="text-right">Giá</TableHead>
                      <TableHead className="text-center">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const stock = product.stockQuantity || 0;
                      const status = getStockStatus(stock);
                      const StatusIcon = status.icon;

                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            #{product.id}
                          </TableCell>
                          <TableCell>
                            {product.imageUrl || product.primaryImageUrl ? (
                              <img
                                src={
                                  product.imageUrl?.startsWith("http") ||
                                  product.imageUrl?.startsWith("data:")
                                    ? product.imageUrl
                                    : `/images/products/${product.imageUrl || product.primaryImageUrl}`
                                }
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg border"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Package className="size-6 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="font-medium">{product.name}</div>
                          </TableCell>
                          <TableCell>{product.brand || "N/A"}</TableCell>
                          <TableCell>{product.categoryName || "N/A"}</TableCell>
                          <TableCell className="text-center">
                            <span className={`text-lg font-bold ${status.color}`}>
                              {stock}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={status.variant}
                              className="flex items-center gap-1 justify-center w-fit mx-auto"
                            >
                              <StatusIcon className="size-3" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {product.price
                              ? `${Number(product.price).toLocaleString("vi-VN")}₫`
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditStock(product)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="size-3" />
                              Sửa
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Trang {currentPage + 1} / {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage >= totalPages - 1}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Stock Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="size-5" />
              Chỉnh sửa số lượng tồn kho
            </DialogTitle>
            <DialogDescription>
              Cập nhật số lượng tồn kho cho sản phẩm{" "}
              <strong>{editingProduct?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentStock">Số lượng hiện tại</Label>
              <Input
                id="currentStock"
                value={editingProduct?.stockQuantity || 0}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newStock">
                Số lượng mới <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newStock"
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="Nhập số lượng mới"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Lý do thay đổi (tùy chọn)</Label>
              <Textarea
                id="reason"
                value={updateReason}
                onChange={(e) => setUpdateReason(e.target.value)}
                placeholder="Nhập lý do thay đổi số lượng..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateStock}
              disabled={isUpdating || !newStock}
              className="bg-brand-primary hover:bg-brand-primary-soft"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
