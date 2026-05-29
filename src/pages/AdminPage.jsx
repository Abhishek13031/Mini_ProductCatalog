import { lazy, Suspense, useState, useTransition, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setProducts as setGlobalProducts } from '../store/productSLice';
import HeroSection from '../features/admin/HeroSection';
import ImportSourcePanel from '../features/admin/ImportSourcePanel';
import MappingPanel from '../features/admin/MappingPanel';
import ProgressBar from '../components/ProgressBar';
import ErrorToast from '../components/ErrorToast';
import { extractHeadersFromFile, extractHeadersFromUrl, importProducts } from '../utils/importService';
import '../App.css';

const CatalogSection = lazy(() => import('../features/admin/CatalogSection'));

export default function AdminPage() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.products);
  const [importMethod, setImportMethod] = useState('file');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [file, setFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [selectedHeaders, setSelectedHeaders] = useState([]);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [editModal, setEditModal] = useState({
    isOpen: false,
    rowKey: '',
    headers: [],
    values: {},
  });
  const [deleteMessage, setDeleteMessage] = useState('');

  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetImportState = () => {
    setProgress(0);
    setCurrentPage(1);
    setCsvHeaders([]);
    setSelectedHeaders([]);
    setErrorMessage('');
  };

  const handleMethodSwitch = (method) => {
    setImportMethod(method);
    setFile(null);
    setApiEndpoint('');
    resetImportState();
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setApiEndpoint('');
    resetImportState();

    try {
      const headers = await extractHeadersFromFile(selectedFile);
      setCsvHeaders(headers);
    } catch (err) {
      setErrorMessage(err?.message || 'Unable to read headers from selected file.');
    }
  };

  const handleLoadHeadersFromUrl = async () => {
    if (!apiEndpoint.trim()) {
      setErrorMessage('Please enter a valid API URL first.');
      return;
    }

    setFile(null);
    resetImportState();

    try {
      const headers = await extractHeadersFromUrl(apiEndpoint.trim());
      setCsvHeaders(headers);
    } catch (err) {
      setErrorMessage(err?.message || 'Unable to load headers from API URL.');
    }
  };

  const handleImport = useCallback(async () => {
    const source = importMethod === 'file' ? file : apiEndpoint.trim();
    if (!source || selectedHeaders.length < 3) {
      setErrorMessage('Please choose at least 3 headers before importing.');
      return;
    }

    dispatch(setGlobalProducts([]));
    setProgress(0);
    setCurrentPage(1);
    setErrorMessage('');

    try {
      let accumulatedProducts = [];
      const mappedProducts = await importProducts({
        importMethod,
        source,
        selectedHeaders,
        onProgress: setProgress,
        onChunk: (chunk) => {
          startTransition(() => {
            accumulatedProducts = [...accumulatedProducts, ...chunk];
            dispatch(setGlobalProducts(accumulatedProducts));
          });
        },
      });

      if (mappedProducts) {
        startTransition(() => {
          dispatch(setGlobalProducts(mappedProducts));
        });
        return mappedProducts;
      }
      return null;
    } catch (err) {
      setErrorMessage(err?.message || 'Import failed. Please verify source and mapping.');
      setProgress(0);
      return null;
    }
  }, [file, apiEndpoint, importMethod, selectedHeaders, dispatch]);

  const handleExport = () => {
    const json = JSON.stringify(products, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'catalog_export.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteProduct = useCallback((rowKey) => {
    const updatedProducts = products.filter(
      (item, index) => (item.__rowId || item.id || item.SKU || `row-${index}`) !== rowKey,
    );
    dispatch(setGlobalProducts(updatedProducts));
    setDeleteMessage('Product deleted successfully.');
  }, [products, dispatch]);

  const handleEditProduct = useCallback((rowKey, headersToEdit = []) => {
    const currentProduct = products.find(
      (item, index) => (item.__rowId || item.id || item.SKU || `row-${index}`) === rowKey,
    );
    if (!currentProduct) return;

    const headers = headersToEdit.slice(0, 3);
    const values = {};
    headers.forEach((header) => {
      values[header] = String(currentProduct[header] ?? '');
    });

    setEditModal({
      isOpen: true,
      rowKey,
      headers,
      values,
    });
  }, [products]);

  const handleEditInputChange = (header, value) => {
    setEditModal((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [header]: value,
      },
    }));
  };

  const handleEditModalClose = () => {
    setEditModal({
      isOpen: false,
      rowKey: '',
      headers: [],
      values: {},
    });
  };

  const handleSaveProductEdit = (e) => {
    e.preventDefault();

    if (!editModal.rowKey) {
      handleEditModalClose();
      return;
    }

    const updatedProducts = products.map((item, index) => {
      const rowKey = item.__rowId || item.id || item.SKU || `row-${index}`;
      if (rowKey !== editModal.rowKey) return item;

      const updatedItem = { ...item };
      editModal.headers.forEach((header) => {
        updatedItem[header] = editModal.values[header] ?? '';
      });
      return updatedItem;
    });

    dispatch(setGlobalProducts(updatedProducts));
    handleEditModalClose();
  };

  return (
    <div className="catalog-shell">
      <div className="catalog-card">
        <ErrorToast message={errorMessage} onClose={() => setErrorMessage('')} />
        <HeroSection />

        <ImportSourcePanel
          importMethod={importMethod}
          onSwitchMethod={handleMethodSwitch}
          file={file}
          onFileChange={handleFileChange}
          apiEndpoint={apiEndpoint}
          onApiEndpointChange={setApiEndpoint}
          onLoadHeadersFromUrl={handleLoadHeadersFromUrl}
        />

        <MappingPanel
          csvHeaders={csvHeaders}
          selectedHeaders={selectedHeaders}
          onSelectionChange={setSelectedHeaders}
          onImport={handleImport}
          isPending={isPending}
        />

        <ProgressBar progress={progress} />

        <Suspense fallback={<section className="panel">Loading catalog...</section>}>
          <CatalogSection
            products={products}
            currentItems={currentItems}
            currentPage={currentPage}
            totalPages={totalPages}
            selectedHeaders={selectedHeaders}
            onExport={handleExport}
            onPaginate={paginate}
            onDeleteRow={handleDeleteProduct}
            onEditRow={handleEditProduct}
          />
        </Suspense>
      </div>

      {editModal.isOpen ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="edit-product-title">
            <h3 id="edit-product-title">Edit Product</h3>
            <form onSubmit={handleSaveProductEdit} className="modal-form">
              {editModal.headers.map((header) => (
                <label key={header} className="modal-field">
                  <span>{header}</span>
                  <input
                    type="text"
                    value={editModal.values[header] ?? ''}
                    onChange={(e) => handleEditInputChange(header, e.target.value)}
                  />
                </label>
              ))}

              <div className="modal-actions">
                <button type="button" className="page-btn" onClick={handleEditModalClose}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteMessage ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-success-title">
            <h3 id="delete-success-title">Delete Status</h3>
            <p className="modal-message">{deleteMessage}</p>
            <div className="modal-actions">
              <button type="button" className="primary-btn" onClick={() => setDeleteMessage('')}>
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
