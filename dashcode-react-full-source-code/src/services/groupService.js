import apiClient from "./apiClient";
const controller = "Group/";
export const getPagingParams = (req) => {
  return apiClient.post(controller + "get-paging", req);
};
export const create = (req) => {
  return apiClient.post(controller + "create", req);
};
export const update = (req) => {
  return apiClient.post(controller + "update/" + req.id, req);
};
export const deleted = (id) => {
  return apiClient.post(controller + "delete" + id);
};
export const getById = (id) => {
  return apiClient.get(controller + "get-by-id/" + id);
};
