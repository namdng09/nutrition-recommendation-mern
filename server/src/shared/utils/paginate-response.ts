export interface PaginateResponse<T> {
  docs: T[];
  total: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}
