import { CreateRequestInput, RequestEntity, RequestType } from "../entities/request.entity";

export interface IRequestRepository {
  createRequest(input: CreateRequestInput): Promise<RequestEntity>;
  getRequestTypes(): Promise<RequestType[]>;
  getRequestDetail(refcode: string): Promise<any>;
}
