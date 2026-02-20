export interface StylistServiceItemResponse {
  stylistId: string;
  serviceId: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  isActive: boolean;
  configured: boolean;
  createdAt?: Date;
}

export class StylistServiceMapper {
  static toItem(data: any): StylistServiceItemResponse {
    return {
      stylistId: data.stylistId,
      serviceId: data.serviceId,
      name: data.name,
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      isActive: data.isActive,
      configured: data.configured,
      createdAt: data.createdAt,
    };
  }

  static toStatus(data: any) {
    return {
      stylistId: data.stylistId,
      serviceId: data.serviceId,
      isActive: data.isActive,
    };
  }
}
