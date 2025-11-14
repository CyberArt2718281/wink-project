export interface TableData {
  columns: string[];
  rows: Record<string, any>[];
}

export interface ResultMetadata {
  detected_encoding: string;
  encoding_used: string;
  file_size_mb: number;
  page_count: number;
  detected_language: string;
  processing_time_seconds: number;
}

export interface SuccessResultResponse {
  job_id: string;
  status: 'completed';
  preset: string;
  requested_columns: string[];
  table: TableData;
  error: null;
  error_code: null;
  is_modified: boolean;
  metadata: ResultMetadata;
}

export interface ErrorResultResponse {
  detail: string;
}

export interface ProcessingResultResponse {
  job_id: string;
  status: 'processing';
  preset: string;
  requested_columns: string[];
  table: null;
  error: null;
  error_code: null;
  is_modified: false;
  metadata: null;
}

export type ResultResponse = SuccessResultResponse | ErrorResultResponse | ProcessingResultResponse;
