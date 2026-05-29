export default function ImportSourcePanel({
  importMethod,
  onSwitchMethod,
  file,
  onFileChange,
  apiEndpoint,
  onApiEndpointChange,
  onLoadHeadersFromUrl,
}) {
  return (
    <section className="panel upload-panel">
      <h2>1. Import Data Source</h2>

      <div className="toggle-group" role="tablist" aria-label="Import source">
        <button type="button" className={importMethod === 'file' ? 'active' : ''} onClick={() => onSwitchMethod('file')}>
          Local File
        </button>
        <button type="button" className={importMethod === 'url' ? 'active' : ''} onClick={() => onSwitchMethod('url')}>
          API URL
        </button>
      </div>

      {importMethod === 'file' ? (
        <>
          <label className="file-drop" htmlFor="csv-upload">
            <span>Choose CSV/JSON file or drag it here</span>
            <strong>{file ? file.name : 'No file selected'}</strong>
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv,.json,application/json,text/csv"
            onChange={onFileChange}
            className="hidden-input"
          />
        </>
      ) : (
        <div className="url-input-wrap">
          <input
            type="url"
            placeholder="https://example.com/products.csv or .json"
            value={apiEndpoint}
            onChange={(e) => onApiEndpointChange(e.target.value)}
            className="url-input"
          />
          <button type="button" onClick={onLoadHeadersFromUrl} className="preview-btn">
            Load Headers
          </button>
        </div>
      )}
    </section>
  );
}
