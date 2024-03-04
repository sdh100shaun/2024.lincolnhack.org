import { describe, expect, it, jest } from '@jest/globals';
import { ApiClient } from '../../../src/services/ApiClient';
import axios, { AxiosHeaders, AxiosInstance } from 'axios';

// write tests for the ApiClient class
describe('ApiClient', function () {
    it('should call axios.get with the correct parameters', async () => {
        // Arrange
        const baseUrl = 'https://example.com';
        const headers = new AxiosHeaders();
        const authToken = 'authToken';
        const endpoint = '/endpoint';
        const params = { param: 'value' };
        const signal = new AbortSignal();
        const response = { data: 'response' };
        const axiosInstance = axios.create();
        const axiosCreateMock = axiosInstance as jest.Mocked<AxiosInstance>;
        jest.spyOn(axios, 'create').mockReturnValue(axiosCreateMock);
        const apiClient = new ApiClient(baseUrl, headers, authToken);
        jest.spyOn(apiClient, 'createClient').mockReturnValue(axiosInstance);
        jest.spyOn(axiosInstance, 'get').mockResolvedValue(response);
        const result = await apiClient.get(endpoint, params, signal);
    
        expect(axiosInstance.get).toHaveBeenCalledWith(endpoint, { signal });
        expect(result).toBe(response.data);
    });
});
