/**
 * CSV Viewer Pro - 100% Offline Web Application
 * Features:
 * - Offline CSV Parsing via PapaParse
 * - Offline Excel Export (.xlsx) via SheetJS
 * - Light & Dark Theme Toggle with Smooth Transition
 * - Animated Loading & Download Icons & Feedback
 * - Column Sorting, Global Search, Column Filtering, Column Visibility
 * - Responsive Pagination & Summary KPI Stats
 */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    rawHeaders: [],
    rawRows: [],
    processedRows: [],
    filteredRows: [],
    visibleColumns: new Set(),
    hiddenColumns: new Set(),
    fileName: 'data.csv',
    fileSize: 0,
    delimiter: ',',
    searchTerm: '',
    sortColumnIndex: null,
    sortDirection: null, // 'asc' | 'desc' | null
    columnFilters: {}, // { colIndex: filterValue }
    currentPage: 1,
    pageSize: 15,
    theme: 'light',
    isLoading: false,
    isExporting: false
  };

  // --- DOM ELEMENTS ---
  const DOM = {
    html: document.documentElement,
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIconContainer: document.getElementById('themeIconContainer'),
    // Upload & Dropzone
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('fileInput'),
    btnUploadPrompt: document.getElementById('btnUploadPrompt'),
    sampleButtons: document.querySelectorAll('.btn-load-sample'),
    // Paste Modal Elements
    btnOpenPasteModal: document.getElementById('btnOpenPasteModal'),
    pasteCsvModal: document.getElementById('pasteCsvModal'),
    btnClosePasteModal: document.getElementById('btnClosePasteModal'),
    btnCancelPaste: document.getElementById('btnCancelPaste'),
    btnSubmitPaste: document.getElementById('btnSubmitPaste'),
    pasteFileNameInput: document.getElementById('pasteFileNameInput'),
    pasteCsvTextarea: document.getElementById('pasteCsvTextarea'),
    // Containers
    welcomeSection: document.getElementById('welcomeSection'),
    viewerSection: document.getElementById('viewerSection'),
    // KPI Stats
    statFileName: document.getElementById('statFileName'),
    statFileSize: document.getElementById('statFileSize'),
    statTotalRows: document.getElementById('statTotalRows'),
    statTotalCols: document.getElementById('statTotalCols'),
    statFilteredRows: document.getElementById('statFilteredRows'),
    statDelimiter: document.getElementById('statDelimiter'),
    // Controls
    globalSearchInput: document.getElementById('globalSearchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    pageSizeSelect: document.getElementById('pageSizeSelect'),
    btnResetData: document.getElementById('btnResetData'),
    btnColVisibility: document.getElementById('btnColVisibility'),
    colVisibilityDropdown: document.getElementById('colVisibilityDropdown'),
    colVisibilityList: document.getElementById('colVisibilityList'),
    btnSelectAllCols: document.getElementById('btnSelectAllCols'),
    btnDeselectAllCols: document.getElementById('btnDeselectAllCols'),
    // Excel & Data Export Buttons
    btnExportExcel: document.getElementById('btnExportExcel'),
    btnExportExcelAll: document.getElementById('btnExportExcelAll'),
    btnExportExcelDropdownToggle: document.getElementById('btnExportExcelDropdownToggle'),
    exportDropdownMenu: document.getElementById('exportDropdownMenu'),
    btnExportCsvFiltered: document.getElementById('btnExportCsvFiltered'),
    btnExportJsonFiltered: document.getElementById('btnExportJsonFiltered'),
    btnCopyTsvClipboard: document.getElementById('btnCopyTsvClipboard'),
    // Table Elements
    tableHeaderRow: document.getElementById('tableHeaderRow'),
    tableBody: document.getElementById('tableBody'),
    tableSkeleton: document.getElementById('tableSkeleton'),
    noDataPlaceholder: document.getElementById('noDataPlaceholder'),
    // Pagination
    paginationInfo: document.getElementById('paginationInfo'),
    btnFirstPage: document.getElementById('btnFirstPage'),
    btnPrevPage: document.getElementById('btnPrevPage'),
    btnNextPage: document.getElementById('btnNextPage'),
    btnLastPage: document.getElementById('btnLastPage'),
    pageNumberButtons: document.getElementById('pageNumberButtons'),
    pageJumpInput: document.getElementById('pageJumpInput'),
    btnJumpPage: document.getElementById('btnJumpPage'),
    // Modals & Overlays
    loadingModal: document.getElementById('loadingModal'),
    loadingStatusText: document.getElementById('loadingStatusText'),
    exportModal: document.getElementById('exportModal'),
    exportProgressBar: document.getElementById('exportProgressBar'),
    exportProgressPercent: document.getElementById('exportProgressPercent'),
    exportStatusText: document.getElementById('exportStatusText'),
    exportIconLoading: document.getElementById('exportIconLoading'),
    exportIconSuccess: document.getElementById('exportIconSuccess'),
    cellDetailModal: document.getElementById('cellDetailModal'),
    cellDetailTitle: document.getElementById('cellDetailTitle'),
    cellDetailContent: document.getElementById('cellDetailContent'),
    btnCopyCellContent: document.getElementById('btnCopyCellContent'),
    btnCloseCellModal: document.getElementById('btnCloseCellModal'),
    // Toast Notification
    toast: document.getElementById('toastNotification'),
    toastMessage: document.getElementById('toastMessage'),
    toastIcon: document.getElementById('toastIcon')
  };

  // --- SVG ICONS (100% Offline Embeds) ---
  const SVG_ICONS = {
    sun: `<svg class="w-5 h-5 text-amber-500 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>`,
    moon: `<svg class="w-5 h-5 text-indigo-400 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>`,
    sortDefault: `<svg class="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"/></svg>`,
    sortAsc: `<svg class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 font-bold transition-transform" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5"/></svg>`,
    sortDesc: `<svg class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 font-bold transition-transform" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>`,
    check: `<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>`,
    downloadArrow: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>`,
    excelFile: `<svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm10.5-8.5l-2.2 3.5 2.3 3.5h-1.6l-1.5-2.5-1.5 2.5H10.4l2.3-3.5-2.2-3.5h1.6l1.4 2.4 1.4-2.4h1.6z"/></svg>`
  };

  // --- THEME MANAGEMENT ---
  function initTheme() {
    const savedTheme = localStorage.getItem('csv_viewer_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setTheme('dark');
    } else {
      setTheme('light');
    }

    DOM.themeToggleBtn.addEventListener('click', toggleTheme);
  }

  function setTheme(theme) {
    state.theme = theme;
    if (theme === 'dark') {
      DOM.html.classList.add('dark');
      DOM.themeIconContainer.innerHTML = SVG_ICONS.moon;
      DOM.themeToggleBtn.setAttribute('title', 'Ganti ke Mode Terang (Light)');
      DOM.themeToggleBtn.setAttribute('aria-label', 'Ganti ke Mode Terang');
    } else {
      DOM.html.classList.remove('dark');
      DOM.themeIconContainer.innerHTML = SVG_ICONS.sun;
      DOM.themeToggleBtn.setAttribute('title', 'Ganti ke Mode Gelap (Dark)');
      DOM.themeToggleBtn.setAttribute('aria-label', 'Ganti ke Mode Gelap');
    }
    localStorage.setItem('csv_viewer_theme', theme);
  }

  function toggleTheme() {
    // Add small click rotation
    DOM.themeIconContainer.classList.add('rotate-45', 'scale-90');
    setTimeout(() => {
      setTheme(state.theme === 'dark' ? 'light' : 'dark');
      DOM.themeIconContainer.classList.remove('rotate-45', 'scale-90');
    }, 150);
  }

  // --- TOAST NOTIFICATION ---
  let toastTimeout = null;
  function showToast(message, type = 'success') {
    if (toastTimeout) clearTimeout(toastTimeout);
    
    DOM.toastMessage.textContent = message;
    
    if (type === 'success') {
      DOM.toastIcon.innerHTML = `<svg class="w-5 h-5 text-emerald-500 animate-pop-in" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path class="animate-checkmark" stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>`;
    } else if (type === 'error') {
      DOM.toastIcon.innerHTML = `<svg class="w-5 h-5 text-rose-500 animate-pop-in" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/></svg>`;
    } else {
      DOM.toastIcon.innerHTML = `<svg class="w-5 h-5 text-blue-500 animate-spin-smooth" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>`;
    }

    DOM.toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
    DOM.toast.classList.add('translate-y-0', 'opacity-100');

    toastTimeout = setTimeout(() => {
      DOM.toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
      DOM.toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3500);
  }

  // --- FORMATTERS ---
  function formatBytes(bytes) {
    if (bytes === 0 || !bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num);
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- CSV PARSING & FILE HANDLING ---
  function handleFileSelect(file) {
    if (!file) return;

    state.fileName = file.name;
    state.fileSize = file.size;

    // Show loading modal with animated icon
    showLoadingModal(`Membaca file "${file.name}"...`);

    const reader = new FileReader();

    reader.onload = function (e) {
      const content = e.target.result;
      updateLoadingStatus('Mengurai dan memetakan struktur baris CSV...');

      setTimeout(() => {
        parseCsvContent(content, file.name, file.size);
      }, 300);
    };

    reader.onerror = function () {
      hideLoadingModal();
      showToast('Gagal membaca file CSV. Pastikan file valid.', 'error');
    };

    reader.readAsText(file, 'UTF-8');
  }

  function loadSampleCsv(samplePath, sampleName) {
    showLoadingModal(`Mengambil contoh data "${sampleName}"...`);

    fetch(samplePath)
      .then(res => {
        if (!res.ok) throw new Error('File tidak ditemukan');
        return res.text();
      })
      .then(content => {
        updateLoadingStatus(`Menguraikan ${sampleName}...`);
        setTimeout(() => {
          parseCsvContent(content, sampleName, new Blob([content]).size);
        }, 300);
      })
      .catch(err => {
        hideLoadingModal();
        showToast(`Gagal memuat sample CSV: ${err.message}`, 'error');
      });
  }

  function parseCsvContent(csvString, fileName, fileSize) {
    if (typeof Papa === 'undefined') {
      hideLoadingModal();
      showToast('Library PapaParse tidak ditemukan secara lokal!', 'error');
      return;
    }

    // Auto-strip UTF-8 BOM if present
    let cleanCsv = csvString;
    if (cleanCsv.charCodeAt(0) === 0xFEFF) {
      cleanCsv = cleanCsv.slice(1);
    }

    Papa.parse(cleanCsv, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false, // Keep as string for precision, we parse when sorting
      complete: function (results) {
        if (!results.data || results.data.length === 0) {
          hideLoadingModal();
          showToast('File CSV kosong atau tidak memiliki baris data yang valid.', 'error');
          return;
        }

        state.fileName = fileName;
        state.fileSize = fileSize;
        state.delimiter = results.meta.delimiter || ',';
        state.rawHeaders = results.meta.fields || Object.keys(results.data[0]);
        
        // Convert to array of objects
        state.rawRows = results.data;
        state.visibleColumns = new Set(state.rawHeaders);
        state.hiddenColumns = new Set();
        state.columnFilters = {};
        state.searchTerm = '';
        state.sortColumnIndex = null;
        state.sortDirection = null;
        state.currentPage = 1;

        if (DOM.globalSearchInput) DOM.globalSearchInput.value = '';

        updateKpiStats();
        setupColumnVisibilityMenu();
        applyFiltersAndSort();

        hideLoadingModal();
        showViewer();
        showToast(`Berhasil memuat ${formatNumber(state.rawRows.length)} baris data!`, 'success');
      },
      error: function (error) {
        hideLoadingModal();
        showToast('Terjadi kesalahan saat mengurai CSV: ' + error.message, 'error');
      }
    });
  }

  // --- UI VIEW SWITCHING ---
  function showViewer() {
    DOM.welcomeSection.classList.add('hidden');
    DOM.viewerSection.classList.remove('hidden');
    DOM.viewerSection.classList.add('animate-fade-in-up');
  }

  function resetToWelcome() {
    state.rawHeaders = [];
    state.rawRows = [];
    state.filteredRows = [];
    state.fileName = 'data.csv';
    state.fileSize = 0;
    state.searchTerm = '';
    state.columnFilters = {};
    state.sortColumnIndex = null;
    state.sortDirection = null;
    state.currentPage = 1;

    if (DOM.fileInput) DOM.fileInput.value = '';
    if (DOM.globalSearchInput) DOM.globalSearchInput.value = '';

    DOM.viewerSection.classList.add('hidden');
    DOM.welcomeSection.classList.remove('hidden');
    DOM.welcomeSection.classList.add('animate-fade-in-up');
    showToast('Tampilan berhasil direset', 'success');
  }

  // --- LOADING MODAL ---
  function showLoadingModal(statusText = 'Memproses data...') {
    state.isLoading = true;
    DOM.loadingStatusText.textContent = statusText;
    DOM.loadingModal.classList.remove('hidden');
    DOM.loadingModal.classList.add('flex');
  }

  function updateLoadingStatus(text) {
    DOM.loadingStatusText.textContent = text;
  }

  function hideLoadingModal() {
    state.isLoading = false;
    DOM.loadingModal.classList.add('hidden');
    DOM.loadingModal.classList.remove('flex');
  }

  // --- KPI STATS UPDATE ---
  function updateKpiStats() {
    DOM.statFileName.textContent = state.fileName;
    DOM.statFileName.setAttribute('title', state.fileName);
    DOM.statFileSize.textContent = formatBytes(state.fileSize);
    DOM.statTotalRows.textContent = formatNumber(state.rawRows.length);
    DOM.statTotalCols.textContent = formatNumber(state.rawHeaders.length);
    DOM.statFilteredRows.textContent = formatNumber(state.filteredRows.length);

    let delimName = state.delimiter;
    if (delimName === ',') delimName = 'Koma (,)';
    else if (delimName === ';') delimName = 'Titik Koma (;)';
    else if (delimName === '\t') delimName = 'Tab (\\t)';
    else if (delimName === '|') delimName = 'Pipe (|)';
    DOM.statDelimiter.textContent = delimName;
  }

  // --- COLUMN VISIBILITY DROPDOWN ---
  function setupColumnVisibilityMenu() {
    DOM.colVisibilityList.innerHTML = '';
    
    state.rawHeaders.forEach((colName, index) => {
      const isVisible = !state.hiddenColumns.has(colName);
      const item = document.createElement('label');
      item.className = 'flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-slate-700/60 rounded-md cursor-pointer transition-colors';
      item.innerHTML = `
        <input type="checkbox" value="${escapeHtml(colName)}" ${isVisible ? 'checked' : ''} 
          class="col-visibility-checkbox rounded text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-600 w-4 h-4 cursor-pointer" />
        <span class="truncate font-mono text-xs">${escapeHtml(colName)}</span>
      `;
      
      const checkbox = item.querySelector('input');
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          state.hiddenColumns.delete(colName);
        } else {
          // Prevent hiding all columns
          if (state.hiddenColumns.size >= state.rawHeaders.length - 1) {
            e.target.checked = true;
            showToast('Minimal satu kolom harus tetap ditampilkan.', 'error');
            return;
          }
          state.hiddenColumns.add(colName);
        }
        renderTable();
      });

      DOM.colVisibilityList.appendChild(item);
    });
  }

  function setAllColumnsVisibility(visible) {
    if (visible) {
      state.hiddenColumns.clear();
    } else {
      // Keep at least the first column
      state.hiddenColumns.clear();
      for (let i = 1; i < state.rawHeaders.length; i++) {
        state.hiddenColumns.add(state.rawHeaders[i]);
      }
    }
    setupColumnVisibilityMenu();
    renderTable();
  }

  // --- FILTERING & SORTING LOGIC ---
  function applyFiltersAndSort() {
    let rows = [...state.rawRows];

    // 1. Global Search Filter
    if (state.searchTerm) {
      const query = state.searchTerm.toLowerCase();
      rows = rows.filter(row => {
        for (const colName of state.rawHeaders) {
          const val = row[colName];
          if (val !== undefined && val !== null && String(val).toLowerCase().includes(query)) {
            return true;
          }
        }
        return false;
      });
    }

    // 2. Specific Column Filters
    const filterKeys = Object.keys(state.columnFilters);
    if (filterKeys.length > 0) {
      rows = rows.filter(row => {
        for (const colName of filterKeys) {
          const filterVal = state.columnFilters[colName].toLowerCase();
          if (filterVal) {
            const cellVal = row[colName];
            if (cellVal === undefined || cellVal === null || !String(cellVal).toLowerCase().includes(filterVal)) {
              return false;
            }
          }
        }
        return true;
      });
    }

    // 3. Sorting
    if (state.sortColumnIndex !== null && state.sortDirection) {
      const colName = state.rawHeaders[state.sortColumnIndex];
      const dir = state.sortDirection === 'asc' ? 1 : -1;

      rows.sort((a, b) => {
        let valA = a[colName];
        let valB = b[colName];

        // Handle null / undefined
        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        // Clean string numbers (e.g. currency, commas)
        const cleanA = String(valA).replace(/[$,]/g, '').trim();
        const cleanB = String(valB).replace(/[$,]/g, '').trim();

        const numA = Number(cleanA);
        const numB = Number(cleanB);

        // Check if both are valid numbers
        if (!isNaN(numA) && !isNaN(numB) && cleanA !== '' && cleanB !== '') {
          return (numA - numB) * dir;
        }

        // Check if both are dates
        const dateA = Date.parse(valA);
        const dateB = Date.parse(valB);
        if (!isNaN(dateA) && !isNaN(dateB) && valA.length > 5 && valB.length > 5) {
          return (dateA - dateB) * dir;
        }

        // Standard string locale comparison
        return String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' }) * dir;
      });
    }

    state.filteredRows = rows;
    updateKpiStats();
    
    // Reset to page 1 if current page is out of bounds
    const maxPage = Math.ceil(state.filteredRows.length / (state.pageSize === -1 ? 1 : state.pageSize)) || 1;
    if (state.currentPage > maxPage) {
      state.currentPage = maxPage;
    }

    renderTable();
    renderPagination();
  }

  // --- TABLE RENDERING ---
  function renderTable() {
    const activeHeaders = state.rawHeaders.filter(h => !state.hiddenColumns.has(h));

    // Render Table Header
    DOM.tableHeaderRow.innerHTML = `
      <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/90 sticky top-0 z-10 border-b border-gray-200 dark:border-slate-700 w-12 text-center">
        #
      </th>
    `;

    activeHeaders.forEach((colName) => {
      const originalColIndex = state.rawHeaders.indexOf(colName);
      const isSorted = state.sortColumnIndex === originalColIndex;
      let sortIcon = SVG_ICONS.sortDefault;
      if (isSorted) {
        sortIcon = state.sortDirection === 'asc' ? SVG_ICONS.sortAsc : SVG_ICONS.sortDesc;
      }

      const th = document.createElement('th');
      th.className = 'px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gray-50 dark:bg-slate-800/90 sticky top-0 z-10 border-b border-gray-200 dark:border-slate-700 group cursor-pointer select-none transition-colors hover:bg-emerald-50/60 dark:hover:bg-slate-700/60 text-gray-700 dark:text-gray-300';
      th.innerHTML = `
        <div class="flex items-center justify-between gap-2">
          <span class="truncate max-w-[200px]" title="${escapeHtml(colName)}">${escapeHtml(colName)}</span>
          <div class="flex items-center gap-1">
            <span class="sort-icon-box p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
              ${sortIcon}
            </span>
          </div>
        </div>
      `;

      th.addEventListener('click', () => {
        handleColumnSort(originalColIndex);
      });

      DOM.tableHeaderRow.appendChild(th);
    });

    // Check if empty
    if (state.filteredRows.length === 0) {
      DOM.tableBody.innerHTML = '';
      DOM.noDataPlaceholder.classList.remove('hidden');
      return;
    }
    DOM.noDataPlaceholder.classList.add('hidden');

    // Slice rows for current page
    let pageRows;
    let startIdx = 0;
    if (state.pageSize === -1) {
      pageRows = state.filteredRows;
    } else {
      startIdx = (state.currentPage - 1) * state.pageSize;
      pageRows = state.filteredRows.slice(startIdx, startIdx + state.pageSize);
    }

    // Render Rows
    const fragment = document.createDocumentFragment();

    pageRows.forEach((row, rowIndex) => {
      const globalRowIdx = startIdx + rowIndex + 1;
      const tr = document.createElement('tr');
      tr.className = 'border-b border-gray-100 dark:border-slate-800/80 hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 transition-colors group';

      // Row index column
      let tdContent = `
        <td class="px-4 py-3 text-xs font-mono text-gray-400 dark:text-gray-500 text-center select-none">
          ${globalRowIdx}
        </td>
      `;

      // Data columns
      activeHeaders.forEach((colName) => {
        const rawVal = row[colName] !== undefined && row[colName] !== null ? String(row[colName]) : '';
        const isLongText = rawVal.length > 40;
        
        tdContent += `
          <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap max-w-[280px] truncate group-hover:text-emerald-950 dark:group-hover:text-emerald-200 ${isLongText ? 'cursor-pointer' : ''}" 
              data-col="${escapeHtml(colName)}" 
              data-val="${escapeHtml(rawVal)}"
              title="${escapeHtml(rawVal)}">
            ${escapeHtml(rawVal || '-')}
          </td>
        `;
      });

      tr.innerHTML = tdContent;

      // Click cell to inspect detail if long text or double click
      tr.querySelectorAll('td[data-col]').forEach(td => {
        td.addEventListener('click', (e) => {
          const col = td.getAttribute('data-col');
          const val = td.getAttribute('data-val');
          if (val && val.length > 25) {
            openCellDetailModal(col, val);
          }
        });
      });

      fragment.appendChild(tr);
    });

    DOM.tableBody.innerHTML = '';
    DOM.tableBody.appendChild(fragment);
  }

  function handleColumnSort(colIndex) {
    if (state.sortColumnIndex === colIndex) {
      if (state.sortDirection === 'asc') {
        state.sortDirection = 'desc';
      } else if (state.sortDirection === 'desc') {
        state.sortDirection = null;
        state.sortColumnIndex = null;
      }
    } else {
      state.sortColumnIndex = colIndex;
      state.sortDirection = 'asc';
    }

    applyFiltersAndSort();
  }

  // --- PAGINATION RENDERING ---
  function renderPagination() {
    const total = state.filteredRows.length;
    if (total === 0) {
      DOM.paginationInfo.textContent = 'Tidak ada data ditemukan';
      DOM.pageNumberButtons.innerHTML = '';
      DOM.btnFirstPage.disabled = true;
      DOM.btnPrevPage.disabled = true;
      DOM.btnNextPage.disabled = true;
      DOM.btnLastPage.disabled = true;
      return;
    }

    const pageSize = state.pageSize === -1 ? total : state.pageSize;
    const totalPages = Math.ceil(total / pageSize);
    const startItem = (state.currentPage - 1) * pageSize + 1;
    const endItem = Math.min(state.currentPage * pageSize, total);

    DOM.paginationInfo.innerHTML = `
      Menampilkan <span class="font-semibold text-gray-900 dark:text-white font-mono">${formatNumber(startItem)}</span> 
      sampai <span class="font-semibold text-gray-900 dark:text-white font-mono">${formatNumber(endItem)}</span> 
      dari <span class="font-semibold text-gray-900 dark:text-white font-mono">${formatNumber(total)}</span> data
    `;

    // Button states
    DOM.btnFirstPage.disabled = state.currentPage === 1;
    DOM.btnPrevPage.disabled = state.currentPage === 1;
    DOM.btnNextPage.disabled = state.currentPage >= totalPages;
    DOM.btnLastPage.disabled = state.currentPage >= totalPages;

    // Render Page Number Buttons (smart window)
    DOM.pageNumberButtons.innerHTML = '';
    const maxButtons = 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'px-2 py-1 text-xs text-gray-400 select-none';
      ellipsis.textContent = '...';
      DOM.pageNumberButtons.appendChild(ellipsis);
    }

    for (let p = startPage; p <= endPage; p++) {
      const btn = document.createElement('button');
      const isActive = p === state.currentPage;
      btn.className = `min-w-[34px] h-[34px] px-2.5 rounded-lg text-xs font-semibold transition-all font-mono ${
        isActive 
          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
      }`;
      btn.textContent = p;
      btn.addEventListener('click', () => {
        state.currentPage = p;
        renderTable();
        renderPagination();
      });
      DOM.pageNumberButtons.appendChild(btn);
    }

    if (endPage < totalPages) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'px-2 py-1 text-xs text-gray-400 select-none';
      ellipsis.textContent = '...';
      DOM.pageNumberButtons.appendChild(ellipsis);
    }
  }

  // --- CELL DETAIL MODAL ---
  function openCellDetailModal(columnName, cellContent) {
    DOM.cellDetailTitle.textContent = `Detail Kolom: ${columnName}`;
    DOM.cellDetailContent.textContent = cellContent;
    DOM.cellDetailModal.classList.remove('hidden');
    DOM.cellDetailModal.classList.add('flex');
  }

  function closeCellDetailModal() {
    DOM.cellDetailModal.classList.add('hidden');
    DOM.cellDetailModal.classList.remove('flex');
  }

  // --- EXCEL EXPORT WITH ENHANCED ANIMATION ---
  function exportToExcel(exportAll = false) {
    if (typeof XLSX === 'undefined') {
      showToast('Library XLSX (SheetJS) tidak ditemukan secara lokal!', 'error');
      return;
    }

    const rowsToExport = exportAll ? state.rawRows : state.filteredRows;

    if (!rowsToExport || rowsToExport.length === 0) {
      showToast('Tidak ada data untuk diekspor ke Excel.', 'error');
      return;
    }

    state.isExporting = true;
    closeExportDropdown();

    // 1. Show Animated Export Modal
    DOM.exportModal.classList.remove('hidden');
    DOM.exportModal.classList.add('flex');
    
    // Reset export modal view
    DOM.exportIconLoading.classList.remove('hidden');
    DOM.exportIconSuccess.classList.add('hidden');
    DOM.exportProgressBar.style.width = '10%';
    DOM.exportProgressPercent.textContent = '10%';
    DOM.exportStatusText.textContent = `Menyiapkan ${formatNumber(rowsToExport.length)} baris data...`;

    // Animate button icon
    DOM.btnExportExcel.classList.add('ring-2', 'ring-emerald-400', 'animate-pulse');

    // Multi-stage animated simulation with real SheetJS processing
    setTimeout(() => {
      // Step 2: Transform Data
      DOM.exportProgressBar.style.width = '35%';
      DOM.exportProgressPercent.textContent = '35%';
      DOM.exportStatusText.textContent = 'Menyusun worksheet dan heading kolom...';

      setTimeout(() => {
        // Step 3: Format Columns & Auto Width
        DOM.exportProgressBar.style.width = '70%';
        DOM.exportProgressPercent.textContent = '70%';
        DOM.exportStatusText.textContent = 'Menghitung lebar kolom otomatis dan optimasi...';

        setTimeout(() => {
          // Step 4: Generate Excel Workbook
          try {
            // Determine columns to export (exclude hidden columns if exporting filtered)
            const exportHeaders = exportAll 
              ? state.rawHeaders 
              : state.rawHeaders.filter(h => !state.hiddenColumns.has(h));

            // Build Array of Arrays (AoA) for maximum control & speed
            const sheetData = [exportHeaders];

            for (let i = 0; i < rowsToExport.length; i++) {
              const row = rowsToExport[i];
              const rowData = exportHeaders.map(col => {
                const val = row[col];
                if (val === undefined || val === null) return '';

                const strVal = String(val).trim();
                if (strVal === '') return '';

                // 1. Cek leading zero (angka dengan nol di depan, cth: "00320832", "0000000027280", "081234567")
                // Harus tetap String agar Excel TIDAK membuang angka 0 di depan!
                const hasLeadingZero = strVal.length > 1 && strVal.startsWith('0') && !strVal.startsWith('0.');

                // 2. Cek kode identitas panjang / Barcode Kasir / NIK (>= 10 digit, cth: "8992832603929")
                // Harus tetap String agar Excel TIDAK mengubahnya menjadi notasi ilmiah (8.99283E+12)!
                const isLongIdentifier = strVal.length >= 10 && /^\d+$/.test(strVal);

                // 3. Cek angka murni untuk perhitungan (Harga, Qty, Desimal, dsb.)
                const isPureNumber = /^-?\d+(\.\d+)?$/.test(strVal);

                if (isPureNumber && !hasLeadingZero && !isLongIdentifier) {
                  return Number(strVal);
                }

                // Pertahankan teks string asli untuk PLU, Barcode, Kode Artikel, dsb.
                return String(val);
              });
              sheetData.push(rowData);
            }

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(sheetData);

            // Tandai sel string secara eksplisit dengan format teks (z: '@') agar Excel menampilkannya persis apa adanya
            if (ws['!ref']) {
              const range = XLSX.utils.decode_range(ws['!ref']);
              for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                  const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                  const cell = ws[cellRef];
                  if (cell && cell.t === 's') {
                    cell.z = '@';
                  }
                }
              }
            }

            // Compute auto column widths
            const colWidths = exportHeaders.map((header, colIdx) => {
              let maxLen = header.length;
              // Sample up to first 200 rows for fast width calculation
              const sampleLimit = Math.min(sheetData.length, 200);
              for (let r = 1; r < sampleLimit; r++) {
                const cellVal = sheetData[r][colIdx];
                if (cellVal !== undefined && cellVal !== null) {
                  const len = String(cellVal).length;
                  if (len > maxLen) maxLen = len;
                }
              }
              return { wch: Math.min(Math.max(maxLen + 3, 10), 60) };
            });
            ws['!cols'] = colWidths;

            // Sheet title sanitization (Excel requires max 31 chars)
            let sheetName = state.fileName.replace(/\.[^/.]+$/, '').replace(/[:\\/?*\[\]]/g, '_').slice(0, 30) || 'Data_CSV';
            XLSX.utils.book_append_sheet(wb, ws, sheetName);

            // Step 5: Finalizing & Triggering Download
            DOM.exportProgressBar.style.width = '100%';
            DOM.exportProgressPercent.textContent = '100%';
            DOM.exportStatusText.textContent = 'Membuat file Excel (.xlsx)...';

            // Generate clean filename
            const dateStr = new Date().toISOString().slice(0, 10);
            const baseName = state.fileName.replace(/\.[^/.]+$/, '');
            const exportTypeStr = exportAll ? 'Semua' : 'Filtered';
            const outputFileName = `${baseName}_Export_${exportTypeStr}_${dateStr}.xlsx`;

            // Trigger download via XLSX.writeFile
            XLSX.writeFile(wb, outputFileName);

            // Success Animation
            DOM.exportIconLoading.classList.add('hidden');
            DOM.exportIconSuccess.classList.remove('hidden');
            DOM.exportStatusText.textContent = `Berhasil! File "${outputFileName}" telah diunduh.`;

            showToast(`File Excel berhasil diunduh (${formatNumber(rowsToExport.length)} baris)!`, 'success');

            // Auto-hide modal after 1.5 seconds
            setTimeout(() => {
              DOM.exportModal.classList.add('hidden');
              DOM.exportModal.classList.remove('flex');
              DOM.btnExportExcel.classList.remove('ring-2', 'ring-emerald-400', 'animate-pulse');
              state.isExporting = false;
            }, 1500);

          } catch (err) {
            console.error(err);
            DOM.exportModal.classList.add('hidden');
            DOM.exportModal.classList.remove('flex');
            DOM.btnExportExcel.classList.remove('ring-2', 'ring-emerald-400', 'animate-pulse');
            state.isExporting = false;
            showToast('Gagal mengekspor ke Excel: ' + err.message, 'error');
          }
        }, 350);
      }, 300);
    }, 250);
  }

  function toggleExportDropdown() {
    DOM.exportDropdownMenu.classList.toggle('hidden');
  }

  function closeExportDropdown() {
    if (DOM.exportDropdownMenu) {
      DOM.exportDropdownMenu.classList.add('hidden');
    }
  }

  // --- CSV & JSON EXPORT + TSV CLIPBOARD COPY ---
  function exportToCsv() {
    closeExportDropdown();
    if (!state.filteredRows || state.filteredRows.length === 0) {
      showToast('Tidak ada data untuk diekspor ke CSV.', 'error');
      return;
    }
    const exportHeaders = state.rawHeaders.filter(h => !state.hiddenColumns.has(h));
    const data = state.filteredRows.map(row => {
      const obj = {};
      exportHeaders.forEach(h => { obj[h] = row[h] !== undefined ? row[h] : ''; });
      return obj;
    });
    const csvStr = Papa.unparse(data);
    const blob = new Blob(["\uFEFF" + csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const baseName = state.fileName.replace(/\.[^/.]+$/, '');
    a.href = url;
    a.download = `${baseName}_filtered.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`File CSV berhasil diunduh (${formatNumber(state.filteredRows.length)} baris)!`, 'success');
  }

  function exportToJson() {
    closeExportDropdown();
    if (!state.filteredRows || state.filteredRows.length === 0) {
      showToast('Tidak ada data untuk diekspor ke JSON.', 'error');
      return;
    }
    const exportHeaders = state.rawHeaders.filter(h => !state.hiddenColumns.has(h));
    const data = state.filteredRows.map(row => {
      const obj = {};
      exportHeaders.forEach(h => { obj[h] = row[h] !== undefined ? row[h] : ''; });
      return obj;
    });
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const baseName = state.fileName.replace(/\.[^/.]+$/, '');
    a.href = url;
    a.download = `${baseName}_filtered.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`File JSON berhasil diunduh (${formatNumber(state.filteredRows.length)} baris)!`, 'success');
  }

  function copyToClipboardAsTsv() {
    closeExportDropdown();
    if (!state.filteredRows || state.filteredRows.length === 0) {
      showToast('Tidak ada data untuk disalin.', 'error');
      return;
    }
    const exportHeaders = state.rawHeaders.filter(h => !state.hiddenColumns.has(h));
    const lines = [exportHeaders.join('\t')];
    state.filteredRows.forEach(row => {
      const line = exportHeaders.map(h => {
        const val = row[h] !== undefined && row[h] !== null ? String(row[h]).replace(/[\t\r\n]/g, ' ') : '';
        return val;
      }).join('\t');
      lines.push(line);
    });
    const tsvContent = lines.join('\n');
    navigator.clipboard.writeText(tsvContent).then(() => {
      showToast(`Berhasil disalin! ${formatNumber(state.filteredRows.length)} baris siap dipaste di Excel (Ctrl+V).`, 'success');
    }).catch(err => {
      showToast('Gagal menyalin ke clipboard: ' + err.message, 'error');
    });
  }

  // --- EVENT LISTENERS INITIALIZATION ---
  function initEventListeners() {
    // Dropzone & File Input
    DOM.fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleFileSelect(file);
    });

    if (DOM.btnUploadPrompt) {
      DOM.btnUploadPrompt.addEventListener('click', () => {
        DOM.fileInput.click();
      });
    }

    // Paste CSV Modal Handlers
    function openPasteModal() {
      DOM.pasteCsvModal.classList.remove('hidden');
      DOM.pasteCsvModal.classList.add('flex');
      setTimeout(() => DOM.pasteCsvTextarea.focus(), 100);
    }

    function closePasteModal() {
      DOM.pasteCsvModal.classList.add('hidden');
      DOM.pasteCsvModal.classList.remove('flex');
      DOM.pasteCsvTextarea.value = '';
    }

    if (DOM.btnOpenPasteModal) {
      DOM.btnOpenPasteModal.addEventListener('click', openPasteModal);
    }
    if (DOM.btnClosePasteModal) {
      DOM.btnClosePasteModal.addEventListener('click', closePasteModal);
    }
    if (DOM.btnCancelPaste) {
      DOM.btnCancelPaste.addEventListener('click', closePasteModal);
    }

    if (DOM.btnSubmitPaste) {
      DOM.btnSubmitPaste.addEventListener('click', () => {
        const text = DOM.pasteCsvTextarea.value.trim();
        if (!text) {
          showToast('Silakan tempel teks CSV terlebih dahulu!', 'error');
          return;
        }

        let name = DOM.pasteFileNameInput.value.trim();
        if (!name) name = 'pasted_data.csv';
        if (!name.endsWith('.csv') && !name.endsWith('.tsv') && !name.endsWith('.txt')) {
          name += '.csv';
        }

        closePasteModal();
        showLoadingModal(`Memproses teks CSV "${name}"...`);

        setTimeout(() => {
          parseCsvContent(text, name, new Blob([text]).size);
        }, 300);
      });
    }

    // Drag and Drop Events with smooth visual indicators
    ['dragenter', 'dragover'].forEach(eventName => {
      DOM.dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        DOM.dropzone.classList.add('border-emerald-500', 'bg-emerald-50/50', 'dark:bg-emerald-950/20', 'scale-[1.01]');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      DOM.dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        DOM.dropzone.classList.remove('border-emerald-500', 'bg-emerald-50/50', 'dark:bg-emerald-950/20', 'scale-[1.01]');
      });
    });

    DOM.dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt.files && dt.files[0];
      if (file) handleFileSelect(file);
    });

    // Sample Data Buttons
    if (DOM.sampleButtons && DOM.sampleButtons.length > 0) {
      DOM.sampleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const samplePath = btn.getAttribute('data-sample');
          const sampleName = btn.getAttribute('data-name');
          loadSampleCsv(samplePath, sampleName);
        });
      });
    }

    // Reset Data Button
    DOM.btnResetData.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin memuat file CSV baru dan mereset tampilan saat ini?')) {
        resetToWelcome();
      }
    });

    // Global Search with Instant Debounce
    let searchDebounce = null;
    DOM.globalSearchInput.addEventListener('input', (e) => {
      if (searchDebounce) clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        state.searchTerm = e.target.value.trim();
        state.currentPage = 1;
        applyFiltersAndSort();
      }, 200);
    });

    DOM.clearSearchBtn.addEventListener('click', () => {
      DOM.globalSearchInput.value = '';
      state.searchTerm = '';
      state.currentPage = 1;
      applyFiltersAndSort();
      DOM.globalSearchInput.focus();
    });

    // Page Size Selector
    DOM.pageSizeSelect.addEventListener('change', (e) => {
      state.pageSize = parseInt(e.target.value, 10);
      state.currentPage = 1;
      renderTable();
      renderPagination();
    });

    // Column Visibility Toggle Dropdown
    DOM.btnColVisibility.addEventListener('click', (e) => {
      e.stopPropagation();
      DOM.colVisibilityDropdown.classList.toggle('hidden');
    });

    DOM.btnSelectAllCols.addEventListener('click', () => {
      setAllColumnsVisibility(true);
    });

    DOM.btnDeselectAllCols.addEventListener('click', () => {
      setAllColumnsVisibility(false);
    });

    // Close Dropdowns on Click Outside
    document.addEventListener('click', (e) => {
      if (!DOM.colVisibilityDropdown.contains(e.target) && !DOM.btnColVisibility.contains(e.target)) {
        DOM.colVisibilityDropdown.classList.add('hidden');
      }
      if (DOM.exportDropdownMenu && !DOM.exportDropdownMenu.contains(e.target) && !DOM.btnExportExcelDropdownToggle.contains(e.target)) {
        closeExportDropdown();
      }
    });

    // Pagination Navigations
    DOM.btnFirstPage.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage = 1;
        renderTable();
        renderPagination();
      }
    });

    DOM.btnPrevPage.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        renderTable();
        renderPagination();
      }
    });

    DOM.btnNextPage.addEventListener('click', () => {
      const maxPage = Math.ceil(state.filteredRows.length / (state.pageSize === -1 ? 1 : state.pageSize));
      if (state.currentPage < maxPage) {
        state.currentPage++;
        renderTable();
        renderPagination();
      }
    });

    DOM.btnLastPage.addEventListener('click', () => {
      const maxPage = Math.ceil(state.filteredRows.length / (state.pageSize === -1 ? 1 : state.pageSize));
      if (state.currentPage < maxPage) {
        state.currentPage = maxPage;
        renderTable();
        renderPagination();
      }
    });

    // Page Jump
    DOM.btnJumpPage.addEventListener('click', () => {
      const targetPage = parseInt(DOM.pageJumpInput.value, 10);
      const maxPage = Math.ceil(state.filteredRows.length / (state.pageSize === -1 ? 1 : state.pageSize)) || 1;
      if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= maxPage) {
        state.currentPage = targetPage;
        renderTable();
        renderPagination();
        DOM.pageJumpInput.value = '';
      } else {
        showToast(`Masukkan nomor halaman antara 1 sampai ${maxPage}`, 'error');
      }
    });

    DOM.pageJumpInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        DOM.btnJumpPage.click();
      }
    });

    // Excel Export Actions
    DOM.btnExportExcel.addEventListener('click', () => {
      exportToExcel(false); // Export Filtered
    });

    DOM.btnExportExcelDropdownToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleExportDropdown();
    });

    DOM.btnExportExcelAll.addEventListener('click', () => {
      exportToExcel(true); // Export All
    });

    if (DOM.btnExportCsvFiltered) {
      DOM.btnExportCsvFiltered.addEventListener('click', exportToCsv);
    }
    if (DOM.btnExportJsonFiltered) {
      DOM.btnExportJsonFiltered.addEventListener('click', exportToJson);
    }
    if (DOM.btnCopyTsvClipboard) {
      DOM.btnCopyTsvClipboard.addEventListener('click', copyToClipboardAsTsv);
    }

    // Cell Detail Modal Actions
    DOM.btnCloseCellModal.addEventListener('click', closeCellDetailModal);
    DOM.cellDetailModal.addEventListener('click', (e) => {
      if (e.target === DOM.cellDetailModal) closeCellDetailModal();
    });

    DOM.btnCopyCellContent.addEventListener('click', () => {
      const text = DOM.cellDetailContent.textContent;
      navigator.clipboard.writeText(text).then(() => {
        showToast('Konten sel berhasil disalin ke clipboard!', 'success');
      }).catch(() => {
        showToast('Gagal menyalin ke clipboard', 'error');
      });
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCellDetailModal();
        closePasteModal();
        DOM.colVisibilityDropdown.classList.add('hidden');
        closeExportDropdown();
      }
      // Ctrl/Cmd + F focus search if viewer active
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !DOM.viewerSection.classList.contains('hidden')) {
        e.preventDefault();
        DOM.globalSearchInput.focus();
        DOM.globalSearchInput.select();
      }
    });
  }

  // --- INTERACTIVE BACKGROUND PARTICLES (100% Offline, Pure Canvas 60fps) ---
  function initInteractiveBackground() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles = [];
    const particleCount = 45;
    const maxDistance = 125;
    const mouse = { x: null, y: null, radius: 140 };

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * (width || window.innerWidth);
        this.y = Math.random() * (height || window.innerHeight);
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2 + 1.2;
        this.baseAlpha = Math.random() * 0.35 + 0.25;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        else if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        else if (this.y > height) this.y = 0;

        // Subtle mouse push
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius && dist > 0) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 1.2;
            this.y -= (dy / dist) * force * 1.2;
          }
        }
      }

      draw(isDark) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(52, 211, 153, ${this.baseAlpha})`
          : `rgba(13, 148, 136, ${this.baseAlpha * 0.8})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      if (document.hidden) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      const isDark = document.documentElement.classList.contains('dark');

      // Draw lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * (isDark ? 0.25 : 0.14);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isDark
              ? `rgba(52, 211, 153, ${alpha})`
              : `rgba(15, 118, 110, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw soft lines to mouse cursor
      if (mouse.x !== null && mouse.y !== null) {
        for (let i = 0; i < particles.length; i++) {
          const dx = mouse.x - particles[i].x;
          const dy = mouse.y - particles[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const alpha = (1 - dist / mouse.radius) * (isDark ? 0.4 : 0.22);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = isDark
              ? `rgba(16, 185, 129, ${alpha})`
              : `rgba(13, 148, 136, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      // Update & render particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(isDark);
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  // --- APPLICATION BOOTSTRAP ---
  function init() {
    initTheme();
    initEventListeners();
    initInteractiveBackground();
    console.log('CSV Viewer Pro initialized in 100% Offline Mode.');
  }

  // Start when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
