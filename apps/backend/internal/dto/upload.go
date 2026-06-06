package dto

// UploadResponse is returned after a file is stored in object storage.
type UploadResponse struct {
	ObjectKey   string `json:"object_key"`
	URL         string `json:"url"`
	FileName    string `json:"file_name"`
	ContentType string `json:"content_type"`
	Size        int64  `json:"size"`
	ExpiresIn   int    `json:"expires_in"`
}
