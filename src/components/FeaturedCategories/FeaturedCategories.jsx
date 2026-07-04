import "./FeaturedCategories.css";

const categories = [
  {
    title: "Electronics",
    icon: "💻",
    description: "Phones, laptops, gadgets and smart devices.",
  },
  {
    title: "Fashion",
    icon: "👕",
    description: "Trending outfits and premium brands.",
  },
  {
    title: "Home",
    icon: "🏠",
    description: "Furniture, decoration and daily essentials.",
  },
  {
    title: "Gaming",
    icon: "🎮",
    description: "Consoles, accessories and gaming gear.",
  },
];

function FeaturedCategories() {
  return (
    <section className="featuredCategories">
      <div className="container">
        <p className="sectionTag">Browse Categories</p>

        <h2>Everything you need in one place.</h2>

        <div className="categoryGrid">
          {categories.map((category) => (
            <article className="categoryCard" key={category.title}>
              <span className="categoryIcon">{category.icon}</span>

              <h3>{category.title}</h3>

              <p>{category.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedCategories;