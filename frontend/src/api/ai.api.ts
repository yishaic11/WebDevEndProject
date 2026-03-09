import api from './axios';

export const aiApi = {
  generateDescription: async (photo: File): Promise<string> => {
    const formData = new FormData();
    formData.append('photo', photo);

    const { data } = await api.post<{ description: string }>('/api/ai/generate', formData);

    return data.description;
  },
};
