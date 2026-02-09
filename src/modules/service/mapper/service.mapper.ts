import type { ServiceDocument } from '../../../models/service.model';
import type { ServiceResponseDto } from '../dto/service.response.dto';

export class ServiceMapper {
  static toDto(doc: ServiceDocument): ServiceResponseDto {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      categoryId: doc.categoryId?._id ? doc.categoryId._id.toString() : doc.categoryId?.toString(),
      imageUrl: doc.imageUrl,
      whatIncluded: doc.whatIncluded || [],
      status: doc.status,
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
