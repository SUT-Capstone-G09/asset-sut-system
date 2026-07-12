import { RequestType } from "../entities/request.entity";
import { IRequestRepository } from "../repositories/request.repository.interface";

export class GetRequestTypesUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(): Promise<RequestType[]> {
    return this.requestRepository.getRequestTypes();
  }
}
