package dto

// UploadResponse is returned after a file is stored in object storage.
type UploadResponse struct {
	BucketName  string `json:"bucket_name"`
	ObjectKey   string `json:"object_key"`
	URL         string `json:"url"`
	DriveURL    string `json:"drive_url,omitempty"` // set when also uploaded to Google Drive
	FileName    string `json:"file_name"`
	ContentType string `json:"content_type"`
	Size        int64  `json:"size"`
	ExpiresIn   int    `json:"expires_in"`
}
