import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllReviews, deleteReview } from "@/api/reviewAPI";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ReviewHeader } from "@/components/Admin/reviews/ReviewHeader";
import { ReviewToolbar } from "@/components/Admin/reviews/ReviewToolbar";
import { ReviewTable } from "@/components/Admin/reviews/ReviewTable";
import { ReviewDetailCard } from "@/components/Admin/reviews/ReviewDetailCard";
import { ReviewDeleteDialog } from "@/components/Admin/reviews/ReviewDeleteDialog";

const RATING_OPTIONS = [
    { value: "ALL", label: "Tất cả" },
    { value: "5", label: "5 sao" },
    { value: "4", label: "4 sao" },
    { value: "3", label: "3 sao" },
    { value: "2", label: "2 sao" },
    { value: "1", label: "1 sao" },
];

const formatDateTime = (value) =>
    value ? new Date(value).toLocaleString("vi-VN") : "--";

export const AdminReview = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filters, setFilters] = useState({ rating: "ALL", search: "" });
    const [searchInput, setSearchInput] = useState("");
    const [selectedReviewId, setSelectedReviewId] = useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [deleteReason, setDeleteReason] = useState("");
    const [deleting, setDeleting] = useState(false);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllReviews();
            const list = Array.isArray(data) ? data : [];
            setReviews(list);
            if (list.length > 0) {
                setSelectedReviewId((prev) => prev ?? list[0].id);
            } else {
                setSelectedReviewId(null);
            }
        } catch (error) {
            console.error("Failed to load reviews", error);
            const message =
                error.response?.data?.message ||
                "Không thể tải danh sách đánh giá";
            toast.error(message);
            setReviews([]);
            setSelectedReviewId(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const filteredReviews = useMemo(() => {
        return reviews.filter((review) => {
            const matchesRating =
                filters.rating === "ALL" ||
                String(review.rating) === filters.rating;
            const term = filters.search.trim().toLowerCase();
            if (!term) {
                return matchesRating;
            }
            const productName = review.productName || "";
            const userName = review.userFullName || review.username || "";
            const comment = review.comment || "";
            const matchesSearch = [productName, userName, comment]
                .join(" ")
                .toLowerCase()
                .includes(term);
            return matchesRating && matchesSearch;
        });
    }, [reviews, filters]);

    useEffect(() => {
        if (filteredReviews.length === 0) {
            setSelectedReviewId(null);
            return;
        }

        setSelectedReviewId((prev) => {
            if (prev && filteredReviews.some((review) => review.id === prev)) {
                return prev;
            }
            return filteredReviews[0].id;
        });
    }, [filteredReviews]);

    const selectedReview = useMemo(
        () =>
            filteredReviews.find((review) => review.id === selectedReviewId) ||
            null,
        [filteredReviews, selectedReviewId]
    );

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
    };

    const handleRatingChange = (event) => {
        setFilters((prev) => ({ ...prev, rating: event.target.value }));
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchReviews();
        setRefreshing(false);
    };

    const handleSelectReview = (reviewId) => {
        setSelectedReviewId(reviewId);
    };

    const openDeleteDialog = (review) => {
        setReviewToDelete(review);
        setDeleteReason("");
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        if (deleting) {
            return;
        }
        setDeleteDialogOpen(false);
        setReviewToDelete(null);
        setDeleteReason("");
    };

    const handleDeleteReasonChange = (event) => {
        setDeleteReason(event.target.value);
    };

    const handleDelete = async () => {
        if (!reviewToDelete) {
            return;
        }
        if (!deleteReason.trim()) {
            toast.error("Vui lòng nhập lý do xóa đánh giá");
            return;
        }

        setDeleting(true);
        try {
            await deleteReview(reviewToDelete.id, deleteReason.trim());
            toast.success("Đã xóa đánh giá thành công");
            setReviews((prev) =>
                prev.filter((review) => review.id !== reviewToDelete.id)
            );
            closeDeleteDialog();
        } catch (error) {
            console.error("Failed to delete review", error);
            const message =
                error.response?.data?.message ||
                "Không thể xóa đánh giá. Vui lòng thử lại.";
            toast.error(message);
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteDialogOpenChange = (open) => {
        if (!open) {
            closeDeleteDialog();
        } else {
            setDeleteDialogOpen(true);
        }
    };

    return (
        <div className="space-y-6">
            <ReviewHeader
                totalReviews={reviews.length}
                loading={loading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
            />

            <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
                <Card className="p-6">
                    <ReviewToolbar
                        searchValue={searchInput}
                        onSearchChange={(event) =>
                            setSearchInput(event.target.value)
                        }
                        onSubmit={handleSearchSubmit}
                        ratingValue={filters.rating}
                        onRatingChange={handleRatingChange}
                        ratingOptions={RATING_OPTIONS}
                    />

                    <ReviewTable
                        reviews={filteredReviews}
                        loading={loading}
                        selectedReviewId={selectedReviewId}
                        onSelect={handleSelectReview}
                        onDelete={openDeleteDialog}
                        formatDateTime={formatDateTime}
                    />
                </Card>

                <ReviewDetailCard
                    review={selectedReview}
                    onDelete={openDeleteDialog}
                    formatDateTime={formatDateTime}
                />
            </div>

            <ReviewDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={handleDeleteDialogOpenChange}
                onClose={closeDeleteDialog}
                onConfirm={handleDelete}
                review={reviewToDelete}
                reason={deleteReason}
                onReasonChange={handleDeleteReasonChange}
                deleting={deleting}
            />
        </div>
    );
};
