import { request } from './client';
import { API_ROUTES } from './routes';

export interface UploadAvatarResponse {
  url: string;
  path: string;
}

export const uploadsApi = {
  uploadAvatar: async (file: FormData) => {
    const response = await request<UploadAvatarResponse>({
      url: API_ROUTES.user.uploadAvatar,
      method: 'POST',
      data: file,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },
};
