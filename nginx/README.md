# Nginx Reverse Proxy Configuration

This folder contains the Nginx configuration for Port Flow's reverse proxy.

## Structure

```
nginx/
├── nginx.conf      # Main Nginx configuration
├── ssl/            # SSL certificates (for HTTPS)
└── README.md       # This file
```

## Routing

| Path | Service | Description |
|------|---------|-------------|
| `/` | transporter-frontend | Carrier/Transporter portal (default) |
| `/admin/*` | admin-platform | Admin dashboard |
| `/operator/*` | operator-frontend | Operator dashboard |
| `/api/*` | backend | Express REST API |
| `/agent/*` | orchestrator | AI Agent orchestrator |

## Virtual Hosts (Production)

For production, you can use separate domains:

| Domain | Service |
|--------|---------|
| `carrier.portflow.com` | Transporter frontend |
| `admin.portflow.com` | Admin platform |
| `operator.portflow.com` | Operator frontend |

Add these to your hosts file for local testing:
```
127.0.0.1 admin.localhost operator.localhost carrier.localhost
```

## SSL Setup

To enable HTTPS:

1. Place your certificates in `nginx/ssl/`:
   - `ssl/cert.pem` - SSL certificate
   - `ssl/key.pem` - Private key

2. Update `nginx.conf` to include SSL configuration:
```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}
```

## Rate Limiting

The configuration includes rate limiting:
- API endpoints: 100 requests/second (burst: 50)
- Agent endpoints: 30 requests/second (burst: 20)

## Security Headers

Included security headers:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
