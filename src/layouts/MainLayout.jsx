import { useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import CampaignShowcase from "../components/CampaignShowcase/CampaignShowcase";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

function MainLayout() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return (
    <div className="app">
      <Header />
      {pathname === "/" ? <CampaignShowcase /> : null}
      <Outlet />
      <Footer />
    </div>
  );
}

export default MainLayout;
