export default function MappingPanel({ csvHeaders, selectedHeaders, onSelectionChange, onImport, isPending }) {
  if (csvHeaders.length === 0) return null;
  const maxSelectableHeaders = 3;

  const toggleHeader = (header) => {
    if (selectedHeaders.includes(header)) {
      onSelectionChange(selectedHeaders.filter((item) => item !== header));
      return;
    }
    if (selectedHeaders.length >= maxSelectableHeaders) {
      return;
    }
    onSelectionChange([...selectedHeaders, header]);
  };

  const handleImportClick = async () => {
    await onImport();
  };

  return (
    <section className="panel mapping-panel">
      <h2>2. Select Headers</h2>
      <div className="mapping-grid">
        {csvHeaders.map((header) => (
          <label key={header}>
            <input
              type="checkbox"
              checked={selectedHeaders.includes(header)}
              onChange={() => toggleHeader(header)}
              disabled={!selectedHeaders.includes(header) && selectedHeaders.length >= maxSelectableHeaders}
            />
            {header}
          </label>
        ))}
      </div>

      <p>Select exactly 3 headers. Selected: {selectedHeaders.length}/3</p>
      <button
        className="primary-btn"
        onClick={handleImportClick}
        disabled={selectedHeaders.length !== 3 || isPending}
      >
        {isPending ? 'Processing...' : 'Run Import'}
      </button>
    </section>
  );
}
