import React, { useState } from "react";
import { Heart, Star } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import ProductImg from "../../assets/images/product.png";

export const ProductCard = ({ image, name, price, rating, numOfRating }) => {
  const [favorite, setFavorite] = useState(false);
  const favoriteColor = favorite ? "#F93C65" : "#000";

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={18} fill="#FFD700" />);
    }

    if (halfStar) {
      stars.push(
        <Star key="half" size={18} fill="url(#halfGradient)" stroke="#FFD700" />
      );
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={18} stroke="#ccc" />);
    }

    return stars;
  };

  return (
    <div className="border rounded-2xl overflow-hidden bg-white flex flex-col shadow-sm hover:shadow-md transition cursor-pointer">
      {/* Ảnh cố định */}
      <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center overflow-hidden">
        {/* <img src={image} alt="product" className="w-full h-full object-cover" /> */}
        <img
          src={ProductImg}
          alt="product"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Nội dung */}
      <div className="flex flex-col justify-between flex-1 p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            {/* Tên sản phẩm giới hạn 2 dòng */}
            <p className="text-[16px] font-bold line-clamp-2 h-12 break-words">
              {name}
            </p>
            <p className="text-[#4880FF] font-medium">{price} VNĐ</p>

            {/* Đánh giá */}
            <div className="flex items-center">
              {renderStars()}
              <span className="ml-2 text-xs text-gray-600">{`(${numOfRating})`}</span>
            </div>
          </div>

          {/* Nút yêu thích */}
          <div
            className="w-[40px] h-[40px] bg-[#F9F9F9] flex justify-center items-center rounded-full cursor-pointer flex-shrink-0"
            onClick={() => setFavorite(!favorite)}
          >
            <Heart
              size={20}
              className="transition"
              style={{ color: favoriteColor }}
            />
          </div>
        </div>

        {/* Nút Add To Cart */}
        <Button
          className={cn(
            "mt-4 w-full bg-[#E2EAF8] hover:bg-[#dbe2ef] text-black cursor-pointer"
          )}
        >
          Add To Cart
        </Button>
      </div>
    </div>
  );
};
