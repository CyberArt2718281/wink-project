// Ответ ошибки от сервера
export interface AnalyzeErrorResponse {
  detail: string
}

// Ответ успешной обработки (processing)
export interface AnalyzeSuccessResponse {
  job_id: string;
  status: 'processing';
  preset: string;
  expected_columns: string[];
  message: string;
}


// Объединённый тип для всех возможных ответов
export type AnalyzeReponseType = AnalyzeErrorResponse | AnalyzeSuccessResponse;

