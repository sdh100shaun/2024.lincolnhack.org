import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosHeaders } from 'axios';

export class ApiClient {
    constructor(
        private readonly baseUrl: string,
        private readonly headers: AxiosHeaders,
        private readonly authToken: string = '',
    ) {}

    public async get(endpoint = '', params?: object, signal?: AbortSignal): Promise<any> {
        try {
            const client = this.createClient(params);
            const response = await client.get(endpoint, { signal });
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                this.handleError(error);
            }
        }
    }

    public async post(endpoint = '', data?: unknown, signal?: AbortSignal): Promise<any> {
        try {
            const client = this.createClient();
            const response = await client.post(endpoint, data, { signal });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                this.handleError(error);
            }
        }
    }

    private createClient(params: object = {}): AxiosInstance {
        const config: AxiosRequestConfig = {
            baseURL: this.baseUrl,
            headers: this.headers,
            params: params,
        };
        if (this.authToken) {
            this.headers.setAuthorization('Bearer ' + this.authToken);
        }
        return axios.create(config);
    }

    private handleError(error: AxiosError): never {
        if (axios.isAxiosError(error)) {
            const { message, response } = error;
            if (response) {
                throw new Error(`Request failed with status code ${response.status}: ${message}`);
            }
            throw new Error(`Request failed: ${message}`);
        }
        throw new Error('Request failed');
    }
}
