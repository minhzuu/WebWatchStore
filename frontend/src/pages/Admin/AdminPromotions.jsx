import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
    getPromotions,
    getPromotionById,
    createPromotion,
    updatePromotion,
    deletePromotion,
} from "@/api/promotionAPI";
import { getProducts } from "@/api/productAPI";
import { PromotionHeader } from "@/components/Admin/promotions/PromotionHeader";
import { PromotionToolbar } from "@/components/Admin/promotions/PromotionToolbar";
import { PromotionTable } from "@/components/Admin/promotions/PromotionTable";
import { PromotionDetailCard } from "@/components/Admin/promotions/PromotionDetailCard";
import { PromotionFormDialog } from "@/components/Admin/promotions/PromotionFormDialog";
import { PromotionDeleteDialog } from "@/components/Admin/promotions/PromotionDeleteDialog";

const formatDateTime = (value) => {
    if (!value) {
        return "--";
    }
    try {
        return new Date(value).toLocaleString("vi-VN");
    } catch {
        return value;
    }
};

const EMPTY_FORM = {
    name: "",
    discount: "",
    startDate: "",
    endDate: "",
    productIds: [],
};

export const AdminPromotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");

    const [selectedPromotionId, setSelectedPromotionId] = useState(null);

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState("create");
    const [formInitialData, setFormInitialData] = useState(EMPTY_FORM);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [editingPromotionId, setEditingPromotionId] = useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [promotionToDelete, setPromotionToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const fetchPromotions = useCallback(
        async ({ silent = false } = {}) => {
            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            try {
                const data = await getPromotions({
                    search: searchKeyword || undefined,
                });
                const list = Array.isArray(data) ? data : [];
                setPromotions(list);

                if (list.length === 0) {
                    setSelectedPromotionId(null);
                } else {
                    setSelectedPromotionId((prev) => {
                        if (prev && list.some((item) => item.id === prev)) {
                            return prev;
                        }
                        return list[0].id;
                    });
                }
            } catch (error) {
                console.error("Failed to load promotions", error);
                const message =
                    error.response?.data?.message ||
                    error.response?.data?.data ||
                    "Không thể tải danh sách khuyến mãi";
                toast.error(message);
                setPromotions([]);
                setSelectedPromotionId(null);
            } finally {
                if (silent) {
                    setRefreshing(false);
                } else {
                    setLoading(false);
                }
            }
        },
        [searchKeyword]
    );

    const fetchProducts = useCallback(async () => {
        setLoadingProducts(true);
        try {
            const response = await getProducts({
                page: 0,
                size: 100,
                sortBy: "name",
                order: "asc",
            });
            const list = Array.isArray(response?.content)
                ? response.content
                : [];
            setProducts(
                list.map((item) => ({
                    id: item.id,
                    name: item.name,
                }))
            );
        } catch (error) {
            console.error("Failed to load products", error);
            toast.error("Không thể tải danh sách sản phẩm");
            setProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    }, []);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const productNameMap = useMemo(() => {
        const map = {};
        for (const product of products) {
            map[product.id] = product.name;
        }
        return map;
    }, [products]);

    const selectedPromotion = useMemo(
        () =>
            promotions.find((item) => item.id === selectedPromotionId) || null,
        [promotions, selectedPromotionId]
    );

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        setSearchKeyword(searchInput.trim());
    };

    const handleRefresh = () => {
        fetchPromotions({ silent: true });
    };

    const handleSelectPromotion = (promotionId) => {
        setSelectedPromotionId(promotionId);
    };

    const handleOpenCreate = () => {
        setFormMode("create");
        setEditingPromotionId(null);
        setFormInitialData(EMPTY_FORM);
        setFormOpen(true);
    };

    const handleEditPromotion = async (promotionId) => {
        try {
            const data = await getPromotionById(promotionId);
            if (!data) {
                toast.error("Không tìm thấy thông tin khuyến mãi");
                return;
            }

            setFormMode("edit");
            setEditingPromotionId(promotionId);
            setFormInitialData({
                name: data.name || "",
                discount: data.discount ?? "",
                startDate: data.startDate || "",
                endDate: data.endDate || "",
                productIds: Array.isArray(data.productIds)
                    ? data.productIds
                    : [],
            });
            setFormOpen(true);
        } catch (error) {
            console.error("Failed to load promotion detail", error);
            const message =
                error.response?.data?.message ||
                error.response?.data?.data ||
                "Không thể tải chi tiết khuyến mãi";
            toast.error(message);
        }
    };

    const handleFormSubmit = async (payload) => {
        setFormSubmitting(true);
        const requestBody = {
            name: payload.name,
            discount: payload.discount,
            startDate: payload.startDate,
            endDate: payload.endDate,
            productIds: Array.isArray(payload.productIds)
                ? payload.productIds
                : [],
        };

        try {
            let response;
            if (formMode === "edit" && editingPromotionId) {
                response = await updatePromotion(
                    editingPromotionId,
                    requestBody
                );
            } else {
                response = await createPromotion(requestBody);
            }

            const message = response?.data || "Thao tác thành công";
            toast.success(message);
            setFormOpen(false);
            setEditingPromotionId(null);
            fetchPromotions({ silent: true });
        } catch (error) {
            console.error("Failed to submit promotion", error);
            const message =
                error.response?.data?.message ||
                error.response?.data?.data ||
                "Không thể lưu khuyến mãi";
            toast.error(message);
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleDeletePromotion = (promotion) => {
        setPromotionToDelete(promotion);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!promotionToDelete) {
            return;
        }
        setDeleting(true);
        try {
            const response = await deletePromotion(promotionToDelete.id);
            const message = response?.data || "Đã xóa khuyến mãi";
            toast.success(message);
            setDeleteDialogOpen(false);
            setPromotionToDelete(null);
            fetchPromotions({ silent: true });
        } catch (error) {
            console.error("Failed to delete promotion", error);
            const message =
                error.response?.data?.message ||
                error.response?.data?.data ||
                "Không thể xóa khuyến mãi";
            toast.error(message);
        } finally {
            setDeleting(false);
        }
    };

    const handleFormOpenChange = (open) => {
        if (!open) {
            setFormOpen(false);
            setFormSubmitting(false);
            setEditingPromotionId(null);
        } else {
            setFormOpen(true);
        }
    };

    const handleDeleteDialogOpenChange = (open) => {
        if (!open) {
            setDeleteDialogOpen(false);
            setPromotionToDelete(null);
        } else {
            setDeleteDialogOpen(true);
        }
    };

    return (
        <div className="space-y-6">
            <PromotionHeader
                totalPromotions={promotions.length}
                loading={loading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                onAdd={handleOpenCreate}
            />

            <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
                <Card className="p-6">
                    <PromotionToolbar
                        searchValue={searchInput}
                        onSearchChange={(event) =>
                            setSearchInput(event.target.value)
                        }
                        onSubmit={handleSearchSubmit}
                    />

                    <PromotionTable
                        promotions={promotions}
                        loading={loading}
                        selectedPromotionId={selectedPromotionId}
                        onSelect={handleSelectPromotion}
                        onEdit={handleEditPromotion}
                        onDelete={handleDeletePromotion}
                        formatDateTime={formatDateTime}
                    />
                </Card>

                <PromotionDetailCard
                    promotion={selectedPromotion}
                    productNameMap={productNameMap}
                    onEdit={handleEditPromotion}
                    onDelete={handleDeletePromotion}
                    formatDateTime={formatDateTime}
                />
            </div>

            <PromotionFormDialog
                open={formOpen}
                mode={formMode}
                initialData={formInitialData}
                onOpenChange={handleFormOpenChange}
                onSubmit={handleFormSubmit}
                onCancel={() => handleFormOpenChange(false)}
                products={products}
                loadingProducts={loadingProducts}
                submitting={formSubmitting}
            />

            <PromotionDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={handleDeleteDialogOpenChange}
                promotion={promotionToDelete}
                onCancel={() => handleDeleteDialogOpenChange(false)}
                onConfirm={handleConfirmDelete}
                deleting={deleting}
            />
        </div>
    );
};
