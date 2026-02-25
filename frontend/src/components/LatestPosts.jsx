import { useState, useEffect } from "react";
import { postAPI, postCategoryAPI } from "../api/cmsAPI";
import { Calendar, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function LatestPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await postAPI.getLatest(4);
      const items = Array.isArray(response) ? response : [];

      // Lấy tất cả categoryId duy nhất
      const categoryIds = items
        .map((p) => p.categoryId)
        .filter(Boolean)
        .reduce((acc, id) => (acc.includes(id) ? acc : [...acc, id]), []);

      // Fetch tất cả category
      const categoriesById = {};
      await Promise.all(
        categoryIds.map(async (id) => {
          try {
            const r = await postCategoryAPI.getById(id);
            const cat = (r && r.data) || r;
            if (cat) categoriesById[id] = cat;
          } catch (err) {
            console.log("Error fetching category for id", id, err);
          }
        })
      );

      const enriched = items.map((p) => {
        const cat = categoriesById[p.categoryId];
        const categorySlug = cat?.slug || "uncategorized";
        // Đảm bảo postCategory luôn tồn tại để tránh lỗi render
        return {
          ...p,
          categorySlug,
          postCategory: p.postCategory || cat || { name: "Tin tức" },
        };
      });
      setPosts(enriched);
    } catch (error) {
      console.error("Error loading posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading || posts.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Tin Tức & Bài Viết
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Cập nhật thông tin mới nhất về đồng hồ và xu hướng thời trang
          </p>
        </div>

        {/* Posts Grid: 1 cột (mobile nhỏ), 2 cột (tablet), 4 cột (desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              // Sử dụng categorySlug đã enrich hoặc fallback an toàn
              to={`/posts/${post.categorySlug || "uncategorized"}/${post.slug}`}
              className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full"
            >
              {/* Cover Image */}
              <div className="relative aspect-video sm:h-48 w-full overflow-hidden bg-gray-100">
                {post.coverImageUrl ? (
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                    No Image
                  </div>
                )}

                {/* Category Badge */}
                {post.postCategory && (
                  <span className="absolute top-3 left-3 bg-brand-primary/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[10px] md:text-xs font-semibold uppercase tracking-wide shadow-sm">
                    {post.postCategory.name}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4 md:p-5 flex flex-col flex-1">
                {/* Date */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                </div>

                {/* Title */}
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>

                {/* Summary */}
                {post.summary && (
                  <p className="text-gray-600 text-xs md:text-sm mb-4 line-clamp-2 flex-1">
                    {post.summary}
                  </p>
                )}

                {/* View Count (Footer of card) */}
                {post.viewCount > 0 && (
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-end text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{post.viewCount} lượt xem</span>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10 md:mt-12">
          <Link
            to="/posts"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-full sm:w-auto inline-block px-8 py-3 bg-white text-brand-primary border border-brand-primary font-semibold rounded-lg hover:bg-brand-primary hover:text-white transition-all duration-300 shadow-sm active:scale-95"
          >
            Xem tất cả bài viết
          </Link>
        </div>
      </div>
    </section>
  );
}
