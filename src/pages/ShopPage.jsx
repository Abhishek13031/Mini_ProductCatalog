import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import ProductCard from "../features/shop/ProductCard";
import ProductFilter from "../components/ProductFilter";
import ProductSearch from "../components/ProductSearch";

export default function ShopPage() {
  const products = useSelector((state) => state.products.products);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = !selectedCategory || (product.category || product.Category) === selectedCategory;
      if (!matchesCategory) return false;

      if (!normalizedQuery) return true;
      const title = String(product.name || product.Title || product.title || "").toLowerCase();
      const sku = String(product.id || product.SKU || product.ID || "").toLowerCase();
      return title.includes(normalizedQuery) || sku.includes(normalizedQuery);
    });
  }, [products, selectedCategory, searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="catalog-shell">
      <main className="catalog-card">
        <header className="hero">
          <p className="eyebrow">Eshop Catalog</p>
          <h1>Product Shop</h1>
          <p className="subtitle">Browse imported products and add items to your cart.</p>
        </header>

        <section className="panel shop-toolbar">
          <ProductSearch value={searchQuery} onChange={handleSearchChange} />
          <ProductFilter
            products={products}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
          <p className="shop-results">
            Showing <strong>{currentItems.length}</strong> of <strong>{filteredProducts.length}</strong> products
          </p>
        </section>

        {products.length === 0 ? (
          <section className="panel shop-empty">
            <h3>No products available</h3>
            <p>Please go to the Admin page and import a data source.</p>
          </section>
        ) : filteredProducts.length === 0 ? (
          <section className="panel shop-empty">
            <h3>No matching products</h3>
            <p>Try a different category or search keyword.</p>
          </section>
        ) : (
          <section className="panel">
            <div className="shop-grid">
              {currentItems.map((product, index) => (
                <ProductCard
                  key={product.id || product.SKU || `${product.name || product.Title || "product"}-${index}`}
                  product={product}
                />      
              ))}
            </div>
          </section>
        )}

        {totalPages > 1 && (
          <section className="pagination-controls">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="page-btn">
              Previous
            </button>

            <div className="page-info">
              Page <strong>{currentPage}</strong> of {totalPages}
            </div>

            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="page-btn">
              Next
            </button>
          </section>
        )}    
      </main>
    </div>
  );
}
