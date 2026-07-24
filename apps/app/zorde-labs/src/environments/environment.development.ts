export const environment = {
	production: false,
	// Via proxy único (scripts/ngrok-dev-proxy.mjs) + 1 túnel ngrok — same-origin, sem CORS.
	// baseUrl: 'https://bartender-shopper-overtake.ngrok-free.dev/v1/api/',
	baseUrl: 'http://localhost:3000/v1/api/',
};
