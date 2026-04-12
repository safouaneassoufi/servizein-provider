import { apiClient } from './client';

export interface UploadResult {
  url: string;
  key: string;
}

export const mediaApi = {
  async upload(uri: string, filename: string, type = 'image/jpeg'): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', { uri, name: filename, type } as unknown as Blob);
    const { data } = await apiClient.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async uploadDocument(uri: string, filename: string): Promise<UploadResult> {
    return this.upload(uri, filename, 'application/pdf');
  },
};
