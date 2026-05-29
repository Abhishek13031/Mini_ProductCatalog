import { useMemo } from "react";

export default function ProductFilter({ products, selectedCategory, onCategoryChange }) {
  const categories = useMemo(() => {
    const categorySet = new Set();
    products.forEach((product) => {
      const categoryValue = product.category || product.Category;
      if (categoryValue) {
        categorySet.add(String(categoryValue));
      }
    });
    return Array.from(categorySet).sort((a, b) => a.localeCompare(b));
  }, [products]);

  return (
    <div className="product-filter">
      <label htmlFor="category-select">Category</label>
      <select
        id="category-select"
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}
