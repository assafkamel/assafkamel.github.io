# Image Steganography research project

This folder contains the GitHub Pages frontend for a browser-based steganography application. The frontend is static HTML, CSS and vanilla JavaScript. Image processing is intended to run on a separate C++ service hosted by the project owner.

## Open the page

After GitHub Pages publishes the `main` branch, visit:

`https://assafkamel.github.io/research/steganography/`

## Configure the API

1. Run the C++ API on your Fedora home server.
2. Put its HTTPS API base URL in **Server connection** (for example, `https://stegano.example.net/api`).
3. Configure the API's CORS allow-list to exactly `https://assafkamel.github.io`.
4. Use secure, HTTP-only session cookies, CSRF protection for state-changing requests, login throttling, upload limits, and server-side file validation.
5. Use a trusted HTTPS reverse proxy or tunnel if people outside your home LAN need access. A private RFC1918 address works only for devices on the same LAN (or connected through your VPN).

Do not put passwords, API keys, or session secrets in this repository or in frontend JavaScript. GitHub Pages is public.

## Frontend API contract

The page expects these routes under the configured API base URL:

- `GET /health` — health status.
- `POST /auth/login` — JSON body: `{ "username": "...", "password": "..." }`; establishes an HTTP-only session.
- `POST /auth/logout` — invalidates the session.
- `GET /auth/me` — returns current session identity.
- `POST /encode` — multipart form fields `image`, `message`, optional `passphrase`, optional `legacy`; returns an image download with Content-Disposition.
- `POST /decode` — multipart form fields `image`, optional `passphrase`, optional `legacy`; returns JSON with a `message` or `text` field.

The frontend uses `credentials: include`. For cross-origin cookies, the service must use `Access-Control-Allow-Origin: https://assafkamel.github.io` (not `*`) and `Access-Control-Allow-Credentials: true`; cookie `SameSite=None; Secure` is generally needed for cross-site use. Browsers may block third-party cookies, so a same-site reverse-proxy hostname or VPN-accessible LAN deployment can be more reliable. Protect all authenticated state-changing routes against CSRF.

## Network model and safety

- **LAN-only:** keep the API bound to the LAN interface/firewall and use the page only while connected to that LAN or VPN.
- **Public portfolio visitors:** a GitHub Pages page cannot reach a private home IP from the public internet. Provide a secure HTTPS tunnel/reverse proxy with strong authentication if external visitors are intended.
- Never expose the C++ process directly to the internet without a hardened TLS-terminating proxy, authentication, request limits, logging, and firewall rules.
- Do not rely on CORS as authentication; it is only a browser access policy.
- JPEG is lossy. Pixel LSB changes are not robust under JPEG recompression; JPEG requires a separate transform-domain algorithm.
- Legacy Pascal compatibility must be tested using known-good input/output fixtures before claiming compatibility.

## Project status

This page is the static frontend and API contract. It does not include or start the C++ backend, and it is not a working end-to-end deployment until the API is built, secured, hosted, and configured above.
