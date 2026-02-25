import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";

export default function Breadcrumb({
  items,
  homeLabel = "Trang chủ",
  homeHref = "/",
  showHome = true,
  stickyTop = 16,
  ariaLabel = "Breadcrumb",
}) {
  const navigate = useNavigate();
  const derivedItems = React.useMemo(() => {
    return Array.isArray(items) && items.length > 0 ? items : [];
  }, [items]);

  const handleItemClick = (e, it) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (!it) return;
    if (typeof it.onClick === "function") return it.onClick(e);
    if (it.href) return navigate(it.href);
  };

  return (
    <nav
      className="bg-white border-b border-gray-200"
      style={{ position: "sticky", top: stickyTop, zIndex: 40 }}
      role="navigation"
      aria-label={ariaLabel}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          {showHome && (
            <button
              onClick={() => navigate(homeHref)}
              className={`cursor-pointer flex items-center gap-1 ${
                derivedItems.length
                  ? "text-foreground/60"
                  : "text-foreground font-medium"
              } hover:text-brand-primary transition-colors`}
              aria-current={derivedItems.length === 0 ? "page" : undefined}
            >
              <Home size={16} />
              <span>{homeLabel}</span>
            </button>
          )}

          {derivedItems.length > 0 &&
            derivedItems.map((it, idx) => {
              const isLast = idx === derivedItems.length - 1;
              return (
                <React.Fragment key={`${it.label}-${idx}`}>
                  <ChevronRight size={16} className="text-gray-400" />
                  {it.onClick || it.href ? (
                    <button
                      onClick={(e) => handleItemClick(e, it)}
                      className={`${
                        isLast || it.isCurrent
                          ? "text-foreground font-medium"
                          : "text-foreground/60"
                      } hover:text-brand-primary transition-colors`}
                      aria-current={isLast || it.isCurrent ? "page" : undefined}
                    >
                      {it.label}
                    </button>
                  ) : (
                    <span
                      className={`${
                        isLast || it.isCurrent
                          ? "text-foreground font-medium"
                          : "text-foreground/60"
                      }`}
                      aria-current={isLast || it.isCurrent ? "page" : undefined}
                    >
                      {it.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
        </div>
      </div>
    </nav>
  );
}
