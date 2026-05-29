export default function CatalogSection({
  products,
  currentItems,
  currentPage,
  totalPages,
  selectedHeaders,
  onExport,
  onPaginate,
  onDeleteRow,
  onEditRow,
}) {
  const derivedHeaders =
    products.length > 0
      ? Object.keys(products[0]).filter((key) => key !== '__rowId')
      : [];
  const displayHeaders = (selectedHeaders.length > 0 ? selectedHeaders : derivedHeaders).slice(0, 3);
  const hasColumns = displayHeaders.length > 0;
  const formatCellValue = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return '[object]';
      }
    }
    return String(value);
  };

  return (
    <section className="panel table-panel">
      <div className="table-head">
        <h2>3. Catalog</h2>
        <button onClick={onExport} disabled={products.length === 0} className="link-btn">
          Export JSON
        </button>
      </div>

      <div className="stats-row">
        <p>
          <strong>{products.length}</strong> records
        </p>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {hasColumns ? (
                <>
                  {displayHeaders.map((header) => <th key={header}>{header}</th>)}
                  <th>Action</th>
                </>
              ) : (
                <th>Data</th>
              )}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={Math.max(displayHeaders.length + (hasColumns ? 1 : 0), 1)} className="empty">
                  No products imported yet.
                </td>
              </tr>
            ) : (
              currentItems.map((product, index) => {
                const rowKey = product.__rowId || product.id || product.SKU || `row-${index}`;
                return (
                <tr key={rowKey}>
                  {displayHeaders.map((header) => (
                    <td key={`${rowKey}-${header}`}>{formatCellValue(product[header])}</td>
                  ))}
                  <td>
                    <button className="link-btn" onClick={() => onEditRow(rowKey, displayHeaders)} type="button">
                      Edit
                    </button>
                    {' '}
                    <button className="link-btn" onClick={() => onDeleteRow(rowKey)} type="button">
                      Delete
                    </button>
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>

      <section className="pagination-controls">
        <button onClick={() => onPaginate(currentPage - 1)} disabled={currentPage === 1} className="page-btn">
          Previous
        </button>

        <div className="page-info">
          Page <strong>{currentPage}</strong> of {totalPages || 1}
        </div>

        <button
          onClick={() => onPaginate(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="page-btn"
        >
          Next
        </button>
      </section>
    </section>
  );
}
