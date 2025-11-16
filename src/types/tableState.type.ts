export interface TableState {
  columns: string[];
  rows: any[];
  filteredRows: any[];
  searchText: string;
  sortColumn: string | null;
  sortOrder: 'asc' | 'desc';
  selectedRows: Set<number>;
  editingCell: EditingCell | null;
  loading: boolean;
  savingCells: Set<string>;
  showExportDialog: boolean;
  exportType: 'excel' | 'csv' | null;
  currentPage: number;
  pageSize: number;
}

export interface EditingCell {
  rowIndex: number;
  columnName: string;
  value: any;
  originalValue: any;
  isLoading: boolean;
  error: string | null;
}
