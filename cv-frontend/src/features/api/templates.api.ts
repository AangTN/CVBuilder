import { ApiClient } from './client';
import { TemplateApiResponse } from './types';

export function createTemplatesApi(client: ApiClient) {
  return {
    getTemplates(): Promise<TemplateApiResponse[]> {
      return client.request<TemplateApiResponse[]>('/templates', {
        method: 'GET',
      });
    },

    getTemplateById(templateId: string): Promise<TemplateApiResponse> {
      return client.request<TemplateApiResponse>(`/templates/${templateId}`, {
        method: 'GET',
      });
    },
  };
}
