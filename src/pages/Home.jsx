import Hero from "../components/Hero/Hero";
import FeaturedCategories from "../components/FeaturedCategories/FeaturedCategories";
import Deals from "../components/Deals/Deals";
import PopularProducts from "../components/PopularProducts/PopularProducts";
import Newsletter from "../components/Newsletter/Newsletter";

function Home() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <Deals />
      <PopularProducts />
      <Newsletter />
    </>
  );
}

export default Home;
