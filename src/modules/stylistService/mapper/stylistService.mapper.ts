import {
  StylistServiceItemResponseDto,
  StylistByServiceResponseDto,
} from '../dto/stylistService.dto';

export class StylistServiceMapper {
  static toItem(data: {
    stylistId: string;
    serviceId: string;
    name: string;
    categoryId?: string;
    categoryName?: string;
    isActive: boolean;
    configured: boolean;
    price?: number;
    duration?: number;
    createdAt?: Date;
  }): StylistServiceItemResponseDto {
    return {
      id: data.serviceId,
      stylistId: data.stylistId,
      serviceId: data.serviceId,
      name: data.name,
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      isActive: data.isActive,
      configured: data.configured,
      price: data.price,
      duration: data.duration,
      createdAt: data.createdAt?.toISOString(),
    };
  }

  static toStatus(data: {
    stylistId: string | object;
    serviceId: string | object;
    isActive: boolean;
  }) {
    return {
      stylistId: data.stylistId.toString(),
      serviceId: data.serviceId.toString(),
      isActive: data.isActive,
    };
  }

  static toStylist(data: {
    stylistId:
      | {
          _id: string | object;
          userId?: { _id: string | object; name: string } | string | object;
          profilePicture?: string;
          specialization?: string[];
          experience?: number;
        }
      | string
      | object;
    isActive: boolean;
  }): StylistByServiceResponseDto {
    const stylist = data.stylistId as {
      _id?: string | object;
      userId?: { _id: string | object; name: string } | string | object;
      profilePicture?: string;
      specialization?: string[];
      experience?: number;
    };
    const user = stylist?.userId as { _id?: string | object; name?: string };

    return {
      stylistId: stylist?._id?.toString() || stylist?.toString() || '',
      userId: user?._id?.toString() || user?.toString() || '',
      name: user?.name || 'Unknown',
      profilePicture: stylist?.profilePicture,
      specialization: stylist?.specialization,
      experience: stylist?.experience,
      isActive: data.isActive,
    };
  }
}
