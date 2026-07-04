import ProductCard from "../ProductCard/ProductCard";
import "./PopularProducts.css";

const products = [
  {
    title: "MacBook Pro",
    category: "Electronics",
    price: 1999,
    image: "💻",
  },
  {
    title: "Gaming Headset",
    category: "Gaming",
    price: 149,
    image: "🎧",
  },
  {
    title: "Smart Watch",
    category: "Wearables",
    price: 299,
    image: "⌚",
  },
  {
    title: "Running Shoes",
    category: "Sports",
    price: 119,
    image: "👟",
  },
];

function PopularProducts() {
  return (
    <section className="popularProducts">
      <div className="container">
        <p className="sectionTag">Popular Products</p>

        <h2>Customer favorites.</h2>

        <div className="productsGrid">
          {products.map((product) => (
            <ProductCard
              key={product.title}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PopularProducts;