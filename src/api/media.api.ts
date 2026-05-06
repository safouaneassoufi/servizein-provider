import { apiClient } from './client';

export interface UploadResult {
  url: string;
  key: string;
}

export const mediaApi = {
  upload(uri: string, filename: string, type = 'image/jpeg'): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', { uri, name: filename, type } as unknown as Blob);
    return apiClient.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }) as any;
  },

  uploadDocument(uri: string, filename: string): Promise<UploadResult> {
    return this.upload(uri, filename, 'application/pdf');
  },
};
