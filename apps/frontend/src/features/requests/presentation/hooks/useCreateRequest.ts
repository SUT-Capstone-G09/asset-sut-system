import { useState, useEffect } from "react";
import { useAuthContext } from "@/lib/context/auth-context";
import { RequestRepository } from "../../data/repositories/request.repository";
import { CreateRequestUseCase } from "../../domain/usecases/create-request.usecase";
import { GetRequestTypesUseCase } from "../../domain/usecases/get-request-types.usecase";
import { RequestType } from "../../domain/entities/request.entity";
import { uploadFile, UPLOAD_FOLDERS } from "@/lib/services/upload";

export function useCreateRequest() {
  const { user, isAuthenticated } = useAuthContext();
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Clean Arch instances
  const requestRepository = new RequestRepository();
  const getRequestTypesUseCase = new GetRequestTypesUseCase(requestRepository);
  const createRequestUseCase = new CreateRequestUseCase(requestRepository);

  // Fetch request categories
  useEffect(() => {
    async function fetchTypes() {
      try {
        const types = await getRequestTypesUseCase.execute();
        setRequestTypes(types);
      } catch (err: any) {
        console.error("Failed to load request types:", err);
      }
    }
    fetchTypes();
  }, []);

  // Autofill contact info when user state is available
  useEffect(() => {
    if (user) {
      const email = user.email || "";
      setContactInfo(email);
    } else {
      setContactInfo("");
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Upload files if any
      const evidenceUrls: string[] = [];
      if (files.length > 0) {
        setUploading(true);
        for (const file of files) {
          try {
            const result = await uploadFile(file, UPLOAD_FOLDERS.BOOKING_DOCS);
            if (result && result.url) {
              evidenceUrls.push(result.url);
            }
          } catch (uploadErr) {
            console.error("Failed to upload file:", file.name, uploadErr);
          }
        }
        setUploading(false);
      }

      // 2. Set nullable incident date
      const incidentDateVal = eventDate.trim() !== "" ? eventDate : null;

      // 3. Call usecase to create the request matching the DTO schema
      await createRequestUseCase.execute({
        title,
        description,
        location,
        request_type_id: selectedTypeId,
        contact_info: contactInfo,
        incident_date: incidentDateVal,
        evidence_urls: evidenceUrls,
      });

      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการสร้างคำร้อง");
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    requestTypes,
    selectedTypeId,
    setSelectedTypeId,
    title,
    setTitle,
    description,
    setDescription,
    contactInfo,
    setContactInfo,
    location,
    setLocation,
    eventDate,
    setEventDate,
    files,
    handleFileChange,
    removeFile,
    uploading,
    loading,
    error,
    showSuccess,
    setShowSuccess,
    handleSubmit,
  };
}
