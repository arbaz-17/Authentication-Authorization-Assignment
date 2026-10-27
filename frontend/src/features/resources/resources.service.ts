import { apiRequest } from "@/api/client";

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceInput {
  title: string;
  description: string | null;
}

interface ResourceResponse {
  resource: Resource;
}

interface ResourceListResponse {
  resources: Resource[];
}

export const resourcesService = {
  list(signal?: AbortSignal) {
    return apiRequest<ResourceListResponse>({
      method: "GET",
      url: "/resources",
      signal,
    });
  },

  create(data: ResourceInput) {
    return apiRequest<ResourceResponse>({
      method: "POST",
      url: "/resources",
      data,
    });
  },

  update(id: string, data: ResourceInput) {
    return apiRequest<ResourceResponse>({
      method: "PATCH",
      url: `/resources/${id}`,
      data,
    });
  },

  remove(id: string) {
    return apiRequest<void>({
      method: "DELETE",
      url: `/resources/${id}`,
    });
  },
};
