import api from "./api";

export const getDocuments = async () => {
    const response = await api.get("/documents");
    return response.data;
};

export const getDocumentById = async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
};

export const createDocument = async (title = "Untitled Document", content = "") => {
    const response = await api.post("/documents", { title, content });
    return response.data;
};

export const updateDocument = async (id, title, content) => {
    const response = await api.put(`/documents/${id}`, { title, content });
    return response.data;
};

export const deleteDocument = async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data; // Returns raw string "Document deleted successfully"
};

export const getDocumentHistory = async (id) => {
    const response = await api.get(`/documents/${id}/history`);
    return response.data;
};

export const restoreDocumentVersion = async (documentId, versionId) => {
    const response = await api.post(`/documents/${documentId}/restore/${versionId}`);
    return response.data;
};

export const shareDocument = async (id, email, permission) => {
    const response = await api.post(`/documents/${id}/share`, { email, permission });
    return response.data; // Returns raw string "Document shared successfully"
};