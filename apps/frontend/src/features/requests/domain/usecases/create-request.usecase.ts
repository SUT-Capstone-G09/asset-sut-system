import { CreateRequestInput, RequestEntity } from "../entities/request.entity";
import { IRequestRepository } from "../repositories/request.repository.interface";

export class CreateRequestUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(input: CreateRequestInput): Promise<RequestEntity> {
    if (!input.title || input.title.trim() === "") {
      throw new Error("กรุณากรอกหัวข้อคำร้อง");
    }
    if (!input.description || input.description.trim() === "") {
      throw new Error("กรุณากรอกรายละเอียดคำร้อง");
    }
    if (!input.location || input.location.trim() === "") {
      throw new Error("กรุณากรอกสถานที่");
    }
    if (!input.request_type_id || input.request_type_id <= 0) {
      throw new Error("กรุณาเลือกประเภทคำร้อง");
    }
    if (!input.contact_info || input.contact_info.trim() === "") {
      throw new Error("กรุณากรอกข้อมูลติดต่อ");
    }

    return this.requestRepository.createRequest(input);
  }
}
