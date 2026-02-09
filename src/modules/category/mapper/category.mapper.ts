import type { CategoryDocument } from '../../../models/category.model';
import type { CategoryResponseDto } from '../dto/category.response.dto';

export class CategoryMapper {
  static toDto(doc: CategoryDocument): CategoryResponseDto {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      status: doc.status,
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
