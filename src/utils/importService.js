import Papa from 'papaparse';

const normalizeJsonToRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.products)) return payload.products;
  }
  throw new Error('JSON must be an array or include data/items/products array.');
};

const collectHeaders = (rows) => {
  if (!rows.length) return [];
  const headers = new Set();
  rows.forEach((row) => {
    if (row && typeof row === 'object') {
      Object.keys(row).forEach((key) => headers.add(key));
    }
  });
  return [...headers];
};

const parseCsvPreviewFromFile = (file) =>
  new Promise((resolve, reject) => {
    Papa.parse(file, {
      preview: 1,
      complete: (results) => resolve(results.data[0] || []),
      error: reject,
    });
  });

const parseCsvPreviewFromText = (text) =>
  new Promise((resolve, reject) => {
    Papa.parse(text, {
      preview: 1,
      complete: (results) => resolve(results.data[0] || []),
      error: reject,
    });
  });

const parseCsvText = (text) =>
  new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => resolve(results.data || []),
      error: reject,
    });
  });

const parseCsvFileInChunks = (file, onChunk, onProgress) =>
  new Promise((resolve, reject) => {
    const estimatedTotal = 2500;
    let rowsSeen = 0;

    Papa.parse(file, {
      header: true,
      worker: true,
      skipEmptyLines: 'greedy',
      chunk: (results) => {
        rowsSeen += results.data.length;
        const progress = Math.min(95, Math.floor((rowsSeen / estimatedTotal) * 100));
        onProgress(progress);
        onChunk(results.data || []);
      },
      complete: resolve,
      error: reject,
    });
  });

const isJsonFile = (file) => file.type.includes('json') || file.name.toLowerCase().endsWith('.json');

const detectJsonText = (contentType, bodyText) => {
  const trimmed = bodyText.trim();
  const looksLikeJson = trimmed.startsWith('{') || trimmed.startsWith('[');
  return contentType.includes('json') || looksLikeJson;
};

export const mapRowsToProducts = (rows, selectedHeaders) =>
  rows.map((row) => {
    // 1. Start by spreading the entire row object so NO data columns are lost!
    const mappedRow = { 
      ...row, 
      __rowId: crypto.randomUUID() 
    };

    // 2. Process your explicitly selected headers
    selectedHeaders.forEach((header) => {
      const value = row?.[header];
      mappedRow[header] = value === undefined || value === null ? '' : String(value);
    });

    // 3. Fallback normalization: Map typical headers to lowercase keys standard across your shop pages
    // This allows you to effortlessly use product.title, product.price, or product.description anywhere.
    mappedRow.id = mappedRow.id || mappedRow.id || mappedRow.SKU || mappedRow.id || mappedRow.__rowId;
    mappedRow.title = mappedRow.title || mappedRow.Title || mappedRow.name || mappedRow.Name;
    mappedRow.price = parseFloat(mappedRow.price || mappedRow.Price || 0);
    mappedRow.description = mappedRow.description || mappedRow.Description || '';
    mappedRow.category = mappedRow.category || mappedRow.Category || 'general';

    return mappedRow;
  });

export const extractHeadersFromFile = async (file) => {
  if (isJsonFile(file)) {
    const payload = JSON.parse(await file.text());
    return collectHeaders(normalizeJsonToRows(payload));
  }
  return parseCsvPreviewFromFile(file);
};

export const extractHeadersFromUrl = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

  const contentType = response.headers.get('content-type') || '';
  const bodyText = await response.text();

  if (detectJsonText(contentType, bodyText)) {
    const payload = JSON.parse(bodyText);
    return collectHeaders(normalizeJsonToRows(payload));
  }

  return parseCsvPreviewFromText(bodyText);
};

export const importProducts = async ({ importMethod, source, selectedHeaders, onProgress, onChunk }) => {
  if (importMethod === 'file' && isJsonFile(source)) {
    onProgress(20);
    const payload = JSON.parse(await source.text());
    const mapped = mapRowsToProducts(normalizeJsonToRows(payload), selectedHeaders);
    onProgress(100);
    return mapped;
  }

  if (importMethod === 'url') {
    onProgress(25);
    const response = await fetch(source);
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

    const contentType = response.headers.get('content-type') || '';
    const bodyText = await response.text();

    if (detectJsonText(contentType, bodyText)) {
      const payload = JSON.parse(bodyText);
      const mapped = mapRowsToProducts(normalizeJsonToRows(payload), selectedHeaders);
      onProgress(100);
      return mapped;
    }

    onProgress(60);
    const rows = await parseCsvText(bodyText);
    const mapped = mapRowsToProducts(rows, selectedHeaders);
    onProgress(100);
    return mapped;
  }

  await parseCsvFileInChunks(
    source,
    (rows) => {
      onChunk(mapRowsToProducts(rows, selectedHeaders));
    },
    onProgress,
  );

  onProgress(100);
  return null;
};
