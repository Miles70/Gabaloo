import { useEffect, useState } from "react";
import "./ProductThumbnail.css";

function ProductThumbnail({ item, alt, loading = "lazy" }) {
  const imageUrl = String(item?.imageUrl || "").trim();
  const fallback = item?.image || "🛍️";
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  if (imageUrl && !imageFailed) {
    return (
      <img
        className="productThumbnail"
        src={imageUrl}
        alt={alt || item?.title || "Product"}
        loading={loading}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span className="productThumbnailFallback" aria-hidden="true">
      {fallback}
    </span>
  );
}

export default ProductThumbnail;
