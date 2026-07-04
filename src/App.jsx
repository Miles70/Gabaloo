import "./index.css";

function App() {
  return (
    <main className="app">
      <section className="hero">
        <nav className="navbar">
          <div className="logo">KemalReis</div>

          <div className="navLinks">
            <a>Categories</a>
            <a>Deals</a>
            <a>New Arrivals</a>
            <a>Support</a>
          </div>

          <button className="navButton">Start Shopping</button>
        </nav>

        <div className="heroContent">
          <p className="eyebrow">Global commerce, reis edition.</p>

          <h1>
            Shop smarter. <br />
            Discover better.
          </h1>

          <p className="heroText">
            KemalReis is being built as a premium e-commerce experience for
            products, deals, categories and smart recommendations.
          </p>

          <div className="heroActions">
            <button>Explore Products</button>
            <button className="ghost">View Categories</button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;