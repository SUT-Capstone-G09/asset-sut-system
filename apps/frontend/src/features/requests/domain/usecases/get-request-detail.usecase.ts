import { IRequestRepository } from "../repositories/request.repository.interface";

export class GetRequestDetailUseCase {
  constructor(private repository: IRequestRepository) {}

  async execute(refcode: string): Promise<any> {
    return this.repository.getRequestDetail(refcode);
  }
}
