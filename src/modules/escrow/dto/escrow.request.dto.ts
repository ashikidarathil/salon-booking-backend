import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

export interface EscrowPaginationQueryDto extends PaginationQueryDto {
  stylistId?: string;
  status?: string;
  releaseDate?: string;
  startDate?: string;
  endDate?: string;
}
