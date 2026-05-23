const DEFAULT_BASE_URL = 'https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records';

export class BoampClient {
  constructor({ baseUrl = DEFAULT_BASE_URL, timeoutMs = 20000 } = {}) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
  }

  async fetchRecords(params = {}) {
    const url = new URL(this.baseUrl);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      const text = await response.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`INVALID_JSON: ${text.slice(0, 300)}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP_${response.status}: ${json.error ?? json.message ?? 'unknown error'}`);
      }

      return { ok: true, url: url.toString(), status: response.status, data: json };
    } catch (error) {
      if (error.name === 'AbortError') {
        return { ok: false, url: url.toString(), error: 'TIMEOUT', details: `Request exceeded ${this.timeoutMs}ms` };
      }
      return { ok: false, url: url.toString(), error: 'REQUEST_FAILED', details: error.message };
    } finally {
      clearTimeout(timeout);
    }
  }
}
