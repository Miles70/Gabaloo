import "./ProductCard.css";

function ProductCard({ product }) {
  return (
    <article className="productCard">
      <div className="productImage">
        <span>{product.image}</span>
      </div>

      <div className="productContent">
        <p className="productCategory">{product.category}</p>

        <h3>{product.title}</h3>

        <div className="productBottom">
          <strong>${product.price}</strong>

          <button>Add</button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;