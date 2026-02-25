import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileTextIcon,
  TagIcon,
  CalendarIcon,
  EyeIcon,
  UserIcon,
  ImageIcon,
} from "lucide-react";

export const PostDetailPanel = ({ postDetail, onClose }) => {
  const isOpen = !!postDetail;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết bài viết</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết về bài viết blog
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        {postDetail && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {postDetail.title}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">ID:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    #{postDetail.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Slug:
                  </span>
                  <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                    {postDetail.slug}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Trạng thái:
                  </span>
                  <Badge
                    variant={
                      postDetail.status === "PUBLISHED"
                        ? "default"
                        : postDetail.status === "DRAFT"
                        ? "secondary"
                        : "outline"
                    }
                    className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                      postDetail.status === "PUBLISHED"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : postDetail.status === "DRAFT"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {postDetail.status === "PUBLISHED"
                      ? "Xuất bản"
                      : postDetail.status === "DRAFT"
                      ? "Nháp"
                      : "Ẩn"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <CalendarIcon className="size-3" />
                    Ngày tạo:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(postDetail.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                {postDetail.updatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <CalendarIcon className="size-3" />
                      Cập nhật:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(postDetail.updatedAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <EyeIcon className="size-3" />
                    Lượt xem:
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {postDetail.viewCount || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Author */}
            {postDetail.author && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon className="size-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Tác giả
                  </h3>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {postDetail.author.fullName || postDetail.author.username}
                  </p>
                  {postDetail.author.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {postDetail.author.email}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Category */}
            {postDetail.postCategory && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TagIcon className="size-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Danh mục
                  </h3>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {postDetail.postCategory.name}
                  </p>
                  {postDetail.postCategory.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {postDetail.postCategory.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Cover Image */}
            {postDetail.coverImageUrl && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="size-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Ảnh bìa
                  </h3>
                </div>
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={postDetail.coverImageUrl}
                    alt={postDetail.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Summary */}
            {postDetail.summary && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Tóm tắt
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {postDetail.summary}
                </p>
              </div>
            )}

            {/* Content Preview */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileTextIcon className="size-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Nội dung
                </h3>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md max-h-96 overflow-y-auto">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: postDetail.content }}
                />
              </div>
            </div>

            {/* Tags */}
            {postDetail.tags && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TagIcon className="size-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Tags
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {postDetail.tags.split(",").map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Info */}
            {(postDetail.seoTitle ||
              postDetail.seoDescription ||
              postDetail.seoKeywords) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Thông tin SEO
                </h3>
                <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  {postDetail.seoTitle && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        SEO Title
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {postDetail.seoTitle}
                      </p>
                    </div>
                  )}
                  {postDetail.seoDescription && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        SEO Description
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {postDetail.seoDescription}
                      </p>
                    </div>
                  )}
                  {postDetail.seoKeywords && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        SEO Keywords
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {postDetail.seoKeywords}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
