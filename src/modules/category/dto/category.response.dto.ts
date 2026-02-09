export interface CategoryResponseDto {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryPaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CategoryPaginatedResponse {
  data: CategoryResponseDto[];
  pagination: CategoryPaginationMetadata;
}
