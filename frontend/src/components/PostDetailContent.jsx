import { Helmet } from "react-helmet-async";
import { Calendar, Eye, Tag } from "lucide-react";

export default function PostDetailContent({ post, formatDate }) {
  return (
    <div className="relative">
      <Helmet>
        <title>{post.seoTitle || post.title} | WATCH STORE</title>
        <meta
          name="description"
          content={post.seoDescription || post.summary || ""}
        />
        <meta name="keywords" content={post.seoKeywords || ""} />
        <meta property="og:title" content={post.seoTitle || post.title} />
        <meta
          property="og:description"
          content={post.seoDescription || post.summary || ""}
        />
        <meta property="og:image" content={post.coverImageUrl} />
        <meta property="og:type" content="article" />
      </Helmet>
      {/* Cover Image */}
      {post.coverImageUrl && (
        <div className="w-full mb-8">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-auto object-cover rounded-2xl"
            style={{ maxHeight: "500px" }}
          />
        </div>
      )}

      {/* Content Card with negative margin overlay effect */}
      <div
        className={`max-w-6xl mx-auto ${
          post.coverImageUrl ? "relative -mt-32" : ""
        }`}
      >
        <article className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8 mb-8">
          {post.postCategory && (
            <span className="inline-block bg-brand-primary text-white px-3 py-1 rounded text-xs font-bold mb-3 uppercase">
              {post.postCategory.name}
            </span>
          )}

          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-6 mb-6 border-b">
            {post.author && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.fullName || post.author.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-semibold text-sm">
                      {(post.author.fullName || post.author.username)
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-brand-primary text-sm">
                    {post.author.fullName || post.author.username}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.publishedAt || post.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.viewCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {post.summary && (
            <div className="bg-gray-50 p-5 mb-8 rounded-lg border-l-4 border-brand-primary">
              <p className="text-base text-gray-700 leading-relaxed font-medium">
                {post.summary}
              </p>
            </div>
          )}

          <div
            className="prose prose-lg max-w-none mb-8 post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              fontSize: "1rem",
              lineHeight: "1.75rem",
              color: "#374151",
            }}
          />

          {post.tags && (
            <div className="flex flex-wrap items-center gap-2 pt-8 border-t">
              <Tag className="w-4 h-4 text-gray-600" />
              {post.tags.split(",").map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
