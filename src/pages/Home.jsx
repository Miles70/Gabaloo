import Hero from "../components/Hero/Hero";
import FeaturedCategories from "../components/FeaturedCategories/FeaturedCategories";
import PopularProducts from "../components/PopularProducts/PopularProducts";

function Home() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <PopularProducts />
    </>
  );
}

export default Home;