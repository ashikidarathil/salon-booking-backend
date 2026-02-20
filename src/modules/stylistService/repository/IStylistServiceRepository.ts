export interface IStylistServiceRepository {
  findByStylistId(stylistId: string): Promise<any[]>;
  toggleStatus(stylistId: string, serviceId: string, isActive: boolean, updatedBy: string): Promise<any>;
  findOne(stylistId: string, serviceId: string): Promise<any>;
}
