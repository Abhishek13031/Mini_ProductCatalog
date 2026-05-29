export default function ProductSearch({ value, onChange }) {
  return (
    <div className="product-search">
      <label htmlFor="product-search-input">Search</label>
      <input
        id="product-search-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by product name or SKU"
      />
    </div>
  );
}
