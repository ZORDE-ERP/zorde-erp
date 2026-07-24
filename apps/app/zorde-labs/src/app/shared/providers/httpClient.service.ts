import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const headers: Record<string, string> = {
	'Content-Type': 'application/json',
	Accept: 'application/json',
	// Ngrok free intercepta User-Agent de browser e devolve HTML sem CORS
	'ngrok-skip-browser-warning': 'true',
};

@Service()
export class HttpClientConfigService {
	private http = inject(HttpClient);
	private BaseUrl = environment.baseUrl;

	public get<T>(url: string): Observable<HttpResponse<T>> {
		return this.http.get<T>(`${this.BaseUrl}${url}`, {
			headers,
			observe: 'response',
			withCredentials: true,
			timeout: 35000,
			mode: 'cors',
		});
	}

	public post<T>(url: string, data: unknown): Observable<HttpResponse<T>> {
		return this.http.post<T>(`${this.BaseUrl}${url}`, data, {
			headers,
			withCredentials: true,
			observe: 'response',
			timeout: 35000,
			mode: 'cors',
		});
	}

	public put<T>(url: string, data: unknown): Observable<HttpResponse<T>> {
		return this.http.put<T>(`${this.BaseUrl}${url}`, data, {
			headers,
			withCredentials: true,
			observe: 'response',
			timeout: 35000,
			mode: 'cors',
		});
	}

	public delete<T>(url: string): Observable<HttpResponse<T>> {
		return this.http.delete<T>(`${this.BaseUrl}${url}`, {
			headers,
			withCredentials: true,
			observe: 'response',
			timeout: 35000,
			mode: 'cors',
		});
	}

	public postBlob(url: string, data: unknown): Observable<HttpResponse<Blob>> {
		return this.http.post(`${this.BaseUrl}${url}`, data, {
			headers: {
				Accept: 'application/pdf',
				'Content-Type': 'application/json',
				'ngrok-skip-browser-warning': 'true',
			},
			withCredentials: true,
			observe: 'response',
			responseType: 'blob',
			timeout: 35000,
		});
	}
}
