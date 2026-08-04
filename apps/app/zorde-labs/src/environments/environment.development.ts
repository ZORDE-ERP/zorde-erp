export const environment = {
	production: false,
	useHydration: false,
	// Via proxy único (scripts/ngrok-dev-proxy.mjs) + 1 túnel ngrok — same-origin, sem CORS.
	// baseUrl: 'https://5914-189-113-18-248.ngrok-free.app/v1/api/',
	baseUrl: 'http://localhost:8080/v1/api/',
};
