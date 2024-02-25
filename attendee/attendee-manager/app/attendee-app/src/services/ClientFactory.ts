import { AxiosHeaders } from 'axios';
import { ApiClient } from './ApiClient';

export class ApiClientFactory {
    constructor(private readonly baseUrl: string, private readonly headers: AxiosHeaders = new AxiosHeaders()) {}

    public createClient(): ApiClient {
        return new ApiClient(this.baseUrl, this.headers);
    }

    public createAuthorisedClient(authToken: string): ApiClient {
        return new ApiClient(this.baseUrl, this.headers, authToken);
    }
}
