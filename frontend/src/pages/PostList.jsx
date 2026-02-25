import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { postAPI, postCategoryAPI } from "@/api/cmsAPI";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import PostDetailContent from "@/components/PostDetailContent";
import { Calendar, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminPagination } from "@/components/Pagination";
import { toast } from "sonner";

export default function PostList() {
  const { categorySlug, postSlug } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const itemsPerPage = 9;
  const slideIntervalRef = useRef(null);

  // --- Logic Fetch Data & Routing (Giữ nguyên) ---
  useEffect(() => {
    loadCategories();
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, currentPage]);

  useEffect(() => {
    let active = true;

    async function fetchForParams() {
      setLoading(true);

      const catSlug = categorySlug;
      const pSlug = postSlug;

      if (catSlug && pSlug) {
        try {
          const category = await postCategoryAPI.getBySlug(catSlug);
          if (!active) return;
          setSelectedCategory(category || null);
        } catch {
          if (!active) return;
          setSelectedCategory(null);
        }

        try {
          await loadPostBySlug(pSlug);
        } finally {
          if (active) setLoading(false);
        }
        return;
      }

      const single = categorySlug;
      if (single) {
        try {
          const category = await postCategoryAPI.getBySlug(single);
          if (!active) return;
          if (category && category.id) {
            setSelectedCategory(category);
            setSelectedPost(null);
            setCurrentPage(1);
            setLoading(false);
            return;
          }
        } catch {
          if (!active) return;
        }

        try {
          await loadPostBySlug(single);
        } finally {
          if (active) setLoading(false);
        }
        return;
      }

      if (active) {
        setSelectedPost(null);
        setSelectedCategory(null);
        setLoading(false);
      }
    }

    fetchForParams();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, postSlug]);

  useEffect(() => {
    if (posts.length > 1) {
      slideIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) =>
          prev === Math.min(5, posts.length) - 1 ? 0 : prev + 1
        );
      }, 5000);

      return () => {
        if (slideIntervalRef.current) {
          clearInterval(slideIntervalRef.current);
        }
      };
    }
  }, [posts.length]);

  const loadCategories = async () => {
    try {
      const response = await postCategoryAPI.getAll();
      const categoriesArray = Array.isArray(response) ? response : [];
      const activeCategories = categoriesArray.filter(
        (cat) => cat.status === "ACTIVE"
      );
      setCategories(activeCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      let response;

      if (selectedCategory) {
        response = await postAPI.getByCategory(
          selectedCategory.id,
          currentPage - 1,
          itemsPerPage
        );
      } else {
        response = await postAPI.getPublished(currentPage - 1, itemsPerPage);
      }

      if (response && response.content !== undefined) {
        setPosts(response.content || []);
        setTotalPages(response.totalPages || 0);
      } else if (Array.isArray(response)) {
        setPosts(response);
        setTotalPages(Math.ceil(response.length / itemsPerPage));
      } else {
        setPosts([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Không thể tải danh sách bài viết");
      setPosts([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setSelectedPost(null);
    navigate(`${category ? `/posts/${category.slug}` : "/posts"}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    // const timeStr = date.toLocaleTimeString("vi-VN", {
    //   hour: "2-digit",
    //   minute: "2-digit",
    // });
    return dateStr; // Rút gọn chỉ hiện ngày cho sạch
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    const strippedText = text.replace(/<[^>]*>/g, "");
    if (strippedText.length <= maxLength) return strippedText;
    return strippedText.substring(0, maxLength) + "...";
  };

  const loadPostBySlug = async (postSlug) => {
    try {
      setLoadingPost(true);
      const response = await postAPI.getBySlug(postSlug);
      setSelectedPost(response);
      if (response?.postCategory) {
        setSelectedCategory(response.postCategory);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error loading post:", error);
      toast.error("Không thể tải bài viết");
      navigate("/posts");
    } finally {
      setLoadingPost(false);
    }
  };

  const handlePostClick = async (e, post) => {
    if (e) e.preventDefault();
    const catSlug = post.postCategory?.slug || "";
    if (catSlug) {
      navigate(`/posts/${catSlug}/${post.slug}`);
    } else {
      navigate(`/posts/${post.slug}`);
    }
  };

  const breadcrumbItems = (() => {
    const items = [{ label: "Tin tức", href: "/posts" }];
    if (selectedCategory) {
      items.push({
        label: selectedCategory.name,
        href: `/posts/${selectedCategory.slug}`,
      });
    }
    if (selectedPost) {
      items.push({ label: selectedPost.title, isCurrent: true });
    } else if (!selectedCategory) {
      items[0].isCurrent = true;
    }
    return items;
  })();

  const PostLink = ({ post, children, className }) => (
    <div
      onClick={(e) => handlePostClick(e, post)}
      className={`${className} cursor-pointer`}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>
          {selectedPost
            ? selectedPost.title
            : "Tin tức & Bài viết - WatchStore"}
        </title>
        <meta
          name="description"
          content="Đọc tin tức, bài viết mới nhất về đồng hồ, xu hướng thời trang và công nghệ"
        />
      </Helmet>

      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <main className="flex-1 py-6 md:py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Main Title */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-3">
              Tin tức & Bài viết
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Cập nhật tin tức mới nhất về đồng hồ, thời trang và xu hướng
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT SIDEBAR: Categories */}
            {/* Desktop: Vertical sticky list | Mobile: Horizontal scrollable list */}
            <aside className="lg:col-span-3 order-1 lg:order-1">
              <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 lg:sticky lg:top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100 hidden lg:block">
                  Danh mục
                </h2>

                {/* Desktop Menu */}
                <nav className="hidden lg:flex flex-col space-y-1">
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      !selectedCategory
                        ? "bg-brand-primary/10 text-brand-primary"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Trang chủ
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory?.id === category.id
                          ? "bg-brand-primary/10 text-brand-primary"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </nav>

                {/* Mobile Menu (Horizontal Scroll) */}
                <div className="lg:hidden overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCategoryChange(null)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        !selectedCategory
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-white text-gray-600 border-gray-200"
                      }`}
                    >
                      Tất cả
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                          selectedCategory?.id === category.id
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-white text-gray-600 border-gray-200"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* RIGHT CONTENT: Posts */}
            <div className="lg:col-span-9 order-2 lg:order-2">
              {selectedPost ? (
                <PostDetailContent
                  post={selectedPost}
                  formatDate={formatDate}
                />
              ) : loading ? (
                <div className="flex justify-center items-center py-20 min-h-[400px]">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-primary border-t-transparent"></div>
                </div>
              ) : loadingPost ? (
                <div className="flex justify-center items-center py-20 min-h-[400px]">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-primary border-t-transparent"></div>
                  <p className="ml-4 text-gray-500">Đang tải bài viết...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <p className="text-gray-500 text-lg">
                    Chưa có bài viết nào trong mục này
                  </p>
                </div>
              ) : (
                <div className="space-y-10 md:space-y-12">
                  {!selectedCategory ? (
                    /* === HOMEPAGE LAYOUT === */
                    <>
                      {/* Section 1: Chủ đề hot */}
                      <div>
                        <div className="flex flex-col gap-2 mb-4">
                          <h2 className="text-xl md:text-2xl font-bold uppercase">
                            Chủ đề hot
                          </h2>
                          <div className="h-1 bg-brand-primary w-24 rounded-full"></div>
                        </div>
                        {/* Horizontal Scroll on Mobile */}
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                          {categories.slice(0, 8).map((category) => (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryChange(category)}
                              className="shrink-0 w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-brand-primary to-brand-primary-soft rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group relative flex items-center justify-center"
                            >
                              <span className="text-white font-bold text-sm md:text-base text-center px-3 line-clamp-2 z-10">
                                #{category.name}
                              </span>
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Section 2: Nổi bật nhất */}
                      <div>
                        <div className="flex flex-col gap-2 mb-4">
                          <h2 className="text-xl md:text-2xl font-bold uppercase">
                            Nổi bật nhất
                          </h2>
                          <div className="h-1 bg-brand-primary w-24 rounded-full"></div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Main Highlight Post */}
                          {posts.length > 0 && (
                            <div className="">
                              <PostLink
                                post={posts[0]}
                                className=" bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden group h-full flex flex-col"
                              >
                                <div className="aspect-video w-full overflow-hidden relative">
                                  <img
                                    src={
                                      posts[0].coverImageUrl ||
                                      "/placeholder.jpg"
                                    }
                                    alt={posts[0].title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <span className="absolute top-3 left-3 bg-brand-primary text-white px-2 py-1 rounded text-xs font-bold uppercase shadow-sm">
                                    Mới
                                  </span>
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-primary transition-colors line-clamp-2">
                                    {posts[0].title}
                                  </h2>
                                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm md:text-base flex-1">
                                    {truncateText(posts[0].summary, 120)}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5" />
                                      {formatDate(
                                        posts[0].publishedAt ||
                                          posts[0].createdAt
                                      )}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-3.5 h-3.5" />
                                      {posts[0].viewCount || 0}
                                    </span>
                                  </div>
                                </div>
                              </PostLink>
                            </div>
                          )}

                          {/* Side List */}
                          <div className="flex flex-col gap-4">
                            {posts.slice(1, 5).map((post) => (
                              <PostLink
                                key={post.id}
                                post={post}
                                className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 hover:shadow-md transition-all group"
                              >
                                <div className="shrink-0 w-24 h-20 md:w-32 md:h-24 rounded-lg overflow-hidden bg-gray-100">
                                  <img
                                    src={
                                      post.coverImageUrl || "/placeholder.jpg"
                                    }
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                  <h3 className="font-bold text-gray-900 line-clamp-2 text-sm md:text-base group-hover:text-brand-primary transition-colors">
                                    {post.title}
                                  </h3>
                                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {formatDate(
                                        post.publishedAt || post.createdAt
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </PostLink>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Two Columns Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: Tin tức mới nhất */}
                        <div>
                          <div className="flex flex-col gap-2 mb-4">
                            <h2 className="text-xl font-bold uppercase">
                              Tin tức cập nhật
                            </h2>
                            <div className="h-1 bg-brand-primary w-24 rounded-full"></div>
                          </div>
                          <div className="space-y-4">
                            {posts.slice(5, 9).map((post) => (
                              <PostLink
                                key={post.id}
                                post={post}
                                className="flex gap-4 group items-start"
                              >
                                <div className="shrink-0 w-28 h-20 rounded-lg overflow-hidden bg-gray-100">
                                  <img
                                    src={
                                      post.coverImageUrl || "/placeholder.jpg"
                                    }
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                                <div>
                                  <h3 className="font-bold text-sm md:text-base text-gray-900 line-clamp-2 group-hover:text-brand-primary transition-colors mb-1">
                                    {post.title}
                                  </h3>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(
                                      post.publishedAt || post.createdAt
                                    )}
                                  </span>
                                </div>
                              </PostLink>
                            ))}
                          </div>
                        </div>

                        {/* Right: Góc Chọn & Mua */}
                        <div>
                          <div className="flex flex-col gap-2 mb-4">
                            <h2 className="text-xl font-bold">
                              Góc Chọn & Mua
                            </h2>
                            <div className="h-1 bg-brand-primary w-24 rounded-full"></div>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            {posts
                              .filter((post) =>
                                post.postCategory?.name
                                  ?.toLowerCase()
                                  .includes("công nghệ")
                              )
                              .slice(0, 3)
                              .map((post) => (
                                <PostLink
                                  key={post.id}
                                  post={post}
                                  className="group"
                                >
                                  <div className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                                    <div className="aspect-2/1 overflow-hidden">
                                      <img
                                        src={
                                          post.coverImageUrl ||
                                          "/placeholder.jpg"
                                        }
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    </div>
                                    <div className="p-3">
                                      <h3 className="font-bold text-sm md:text-base text-gray-900 line-clamp-2 group-hover:text-brand-primary transition-colors">
                                        {post.title}
                                      </h3>
                                    </div>
                                  </div>
                                </PostLink>
                              ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* === CATEGORY LAYOUT === */
                    <>
                      {/* Section 1: Slider Featured */}
                      <div className="relative bg-white rounded-xl shadow-sm overflow-hidden group">
                        <div className="relative overflow-hidden">
                          <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{
                              transform: `translateX(-${currentSlide * 100}%)`,
                            }}
                          >
                            {posts
                              .slice(0, Math.min(3, posts.length))
                              .map((post) => (
                                <div key={post.id} className="min-w-full">
                                  <PostLink post={post} className="block">
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                      {/* Image */}
                                      <div className="aspect-video md:aspect-auto md:h-[350px] overflow-hidden relative">
                                        <img
                                          src={post.coverImageUrl}
                                          alt={post.title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent md:hidden"></div>
                                      </div>
                                      {/* Content */}
                                      <div className="p-5 md:p-8 flex flex-col justify-center bg-white">
                                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 hover:text-brand-primary transition-colors line-clamp-3">
                                          {post.title}
                                        </h2>
                                        {post.summary && (
                                          <p className="text-gray-600 mb-4 line-clamp-3 text-sm md:text-base leading-relaxed">
                                            {truncateText(post.summary, 150)}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs md:text-sm text-gray-500 mt-auto">
                                          <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />{" "}
                                            {formatDate(
                                              post.publishedAt || post.createdAt
                                            )}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />{" "}
                                            {post.viewCount || 0}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </PostLink>
                                </div>
                              ))}
                          </div>
                        </div>
                        {/* Slider Controls */}
                        {posts.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                setCurrentSlide((prev) =>
                                  prev === 0
                                    ? Math.min(3, posts.length) - 1
                                    : prev - 1
                                )
                              }
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md z-10 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                setCurrentSlide((prev) =>
                                  prev === Math.min(3, posts.length) - 1
                                    ? 0
                                    : prev + 1
                                )
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md z-10 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Section 2: Post Grid */}
                      <div>
                        <div className="flex flex-col gap-2 mb-6">
                          <h2 className="text-xl font-bold uppercase">
                            Bài viết mới nhất
                          </h2>
                          <div className="h-1 bg-brand-primary w-24 rounded-full"></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {posts.slice(3).map((post) => (
                            <PostLink
                              key={post.id}
                              post={post}
                              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full"
                            >
                              <div className="aspect-video w-full overflow-hidden relative">
                                <img
                                  src={post.coverImageUrl || "/placeholder.jpg"}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                              <div className="p-4 flex flex-col flex-1">
                                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors text-base">
                                  {post.title}
                                </h3>
                                <p className="text-gray-600 text-xs md:text-sm line-clamp-3 mb-4 flex-1">
                                  {truncateText(post.summary, 100)}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t border-gray-50">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />{" "}
                                    {formatDate(
                                      post.publishedAt || post.createdAt
                                    )}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5" />{" "}
                                    {post.viewCount || 0}
                                  </span>
                                </div>
                              </div>
                            </PostLink>
                          ))}
                        </div>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="mt-8">
                          <AdminPagination
                            page={currentPage}
                            totalPages={totalPages}
                            handlePageChange={setCurrentPage}
                            handlePrev={() =>
                              setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                            handleNext={() =>
                              setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1)
                              )
                            }
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
