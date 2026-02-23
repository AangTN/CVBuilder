import { ApiClient } from './client';
import { ApiError, CvApiResponse, CvPayload, ExportHistoryResponse } from './types';

export function createCvsApi(client: ApiClient) {
  return {
    createCv(accessToken: string, cvData: CvPayload): Promise<CvApiResponse> {
      return client.request<CvApiResponse>('/cvs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(cvData),
      });
    },

    updateCv(
      accessToken: string,
      cvId: string,
      cvData: CvPayload,
    ): Promise<CvApiResponse> {
      return client.request<CvApiResponse>(`/cvs/${cvId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(cvData),
      });
    },

    getCvById(accessToken: string, cvId: string): Promise<CvApiResponse> {
      return client.request<CvApiResponse>(`/cvs/${cvId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },

    getUserCvs(accessToken: string): Promise<CvApiResponse[]> {
      return client.request<CvApiResponse[]>('/cvs', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },

    getUserCvsSummary(accessToken: string): Promise<CvApiResponse[]> {
      return client.request<CvApiResponse[]>('/cvs/summary', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },

    getUserExportHistory(
      accessToken: string,
      page = 1,
      pageSize = 20,
    ): Promise<ExportHistoryResponse> {
      return client.request<ExportHistoryResponse>(
        `/cvs/exports/history?page=${page}&pageSize=${pageSize}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    },

    deleteCv(accessToken: string, cvId: string): Promise<{ message?: string }> {
      return client.request<{ message?: string }>(`/cvs/${cvId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },

    async exportCvPdf(
      accessToken: string,
      payload: { cvId: string; filename?: string },
    ): Promise<Blob> {
      const url = `${client.getBaseUrl()}/cvs/export`;

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = 'Failed to download PDF';
        try {
          const data = await response.json();
          message = data?.message || message;
        } catch {
          try {
            const text = await response.text();
            if (text) {
              message = text.slice(0, 500);
            }
          } catch {
            // keep default message
          }
        }

        throw {
          message,
          statusCode: response.status,
        } as ApiError;
      }

      return response.blob();
    },

    createExportCv(accessToken: string, cvData: CvPayload): Promise<{ id: string }> {
      return client.request<{ id: string }>('/cvs/export-create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(cvData),
      });
    },
  };
}
