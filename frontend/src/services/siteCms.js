import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const api = axios.create({
  baseURL: `${BACKEND_URL}/api/site`,
  timeout: 15000,
});

const authHeaders = () => {
  const token = localStorage.getItem('ap_elite_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const siteCms = {
  async bootstrap() {
    const { data } = await api.get('/bootstrap');
    return data;
  },
  async content(params = {}) {
    const { data } = await api.get('/content', { params });
    return data;
  },
  async contentDetail(slug) {
    const { data } = await api.get(`/content/${slug}`);
    return data;
  },
  async page(slug) {
    const { data } = await api.get(`/pages/${slug}`);
    return data;
  },
  async search(query) {
    const { data } = await api.get('/search', { params: { q: query } });
    return data;
  },
  admin: {
    async overview() {
      const { data } = await api.get('/admin/overview', { headers: authHeaders() });
      return data;
    },
    async settings() {
      const { data } = await api.get('/admin/settings', { headers: authHeaders() });
      return data;
    },
    async updateSettings(payload) {
      const { data } = await api.put('/admin/settings', payload, { headers: authHeaders() });
      return data;
    },
    async navigation() {
      const { data } = await api.get('/admin/navigation', { headers: authHeaders() });
      return data;
    },
    async createNavigation(payload) {
      const { data } = await api.post('/admin/navigation', payload, { headers: authHeaders() });
      return data;
    },
    async updateNavigation(id, payload) {
      const { data } = await api.put(`/admin/navigation/${id}`, payload, { headers: authHeaders() });
      return data;
    },
    async deleteNavigation(id) {
      const { data } = await api.delete(`/admin/navigation/${id}`, { headers: authHeaders() });
      return data;
    },
    async pages() {
      const { data } = await api.get('/admin/pages', { headers: authHeaders() });
      return data;
    },
    async createPage(payload) {
      const { data } = await api.post('/admin/pages', payload, { headers: authHeaders() });
      return data;
    },
    async updatePage(id, payload) {
      const { data } = await api.put(`/admin/pages/${id}`, payload, { headers: authHeaders() });
      return data;
    },
    async deletePage(id) {
      const { data } = await api.delete(`/admin/pages/${id}`, { headers: authHeaders() });
      return data;
    },
    async contents(params = {}) {
      const { data } = await api.get('/admin/contents', { params, headers: authHeaders() });
      return data;
    },
    async createContent(payload) {
      const { data } = await api.post('/admin/contents', payload, { headers: authHeaders() });
      return data;
    },
    async updateContent(id, payload) {
      const { data } = await api.put(`/admin/contents/${id}`, payload, { headers: authHeaders() });
      return data;
    },
    async publishContent(id) {
      const { data } = await api.post(`/admin/contents/${id}/publish`, {}, { headers: authHeaders() });
      return data;
    },
    async deleteContent(id) {
      const { data } = await api.delete(`/admin/contents/${id}`, { headers: authHeaders() });
      return data;
    },
    async media() {
      const { data } = await api.get('/admin/media', { headers: authHeaders() });
      return data;
    },
    async uploadMedia(file, metadata = {}) {
      const form = new FormData();
      form.append('file', file);
      form.append('alt_text', metadata.alt_text || '');
      form.append('caption', metadata.caption || '');
      form.append('rights', metadata.rights || 'Uso institucional autorizado');
      const { data } = await api.post('/admin/media', form, {
        headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    async updateMedia(id, metadata = {}) {
      const form = new FormData();
      form.append('alt_text', metadata.alt_text || '');
      form.append('caption', metadata.caption || '');
      form.append('rights', metadata.rights || 'Uso institucional autorizado');
      const { data } = await api.put(`/admin/media/${id}`, form, {
        headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    async deleteMedia(id) {
      const { data } = await api.delete(`/admin/media/${id}`, { headers: authHeaders() });
      return data;
    },
    async audit() {
      const { data } = await api.get('/admin/audit', { headers: authHeaders() });
      return data;
    },
    async seed() {
      const { data } = await api.post('/admin/seed', {}, { headers: authHeaders() });
      return data;
    },
  },
};

export const resolveMediaUrl = (url = '') => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${BACKEND_URL}${url}`;
};
