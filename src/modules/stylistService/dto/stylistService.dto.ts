export interface ToggleStylistServiceStatusRequestDto {
  isActive: boolean;
}

export interface StylistServiceItemResponseDto {
  id: string;
  stylistId: string;
  serviceId: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  isActive: boolean;
  configured: boolean;
  price?: number;
  duration?: number;
  createdAt?: string;
}

export interface StylistByServiceResponseDto {
  stylistId: string;
  userId: string;
  name: string;
  profilePicture?: string;
  specialization?: string[];
  experience?: number;
  isActive: boolean;
}
