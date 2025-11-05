# Deployment Guide

This guide covers deployment configurations and infrastructure for Merkle Pay.

## Architecture Overview

Merkle Pay uses Docker Compose for production deployment with Caddy as a reverse proxy.

```
                    ┌─────────────┐
                    │   Internet  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Caddy    │  (Ports 80, 443)
                    │  (SSL/TLS)  │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌─────▼─────┐    ┌─────▼──────┐
    │   /     │      │   /api    │    │ /dashboard │
    │ Payment │      │  Backend  │    │   Admin    │
    │  Form   │      │    API    │    │    SPA     │
    └─────────┘      └───────────┘    └────────────┘
         │                 │                 │
    ┌────▼─────────────────▼─────────────────▼────┐
    │           merkle-pay (Next.js)              │
    │              Port 8888 (internal)            │
    └──────────────────────┬──────────────────────┘
                           │
    ┌──────────────────────▼──────────────────────┐
    │        PostgreSQL Database                   │
    │           (Persistent Volume)                │
    └─────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────┐
    │    merkle-dashboard (Static Files)          │
    │         Built to /dist volume               │
    └─────────────────────────────────────────────┘
```

## Docker Compose Configuration

### Services

**File:** `compose.yml`

```yaml
Services:
├── merkle-pay
│   ├── Build: Dockerfile (Node.js + Next.js)
│   ├── Port: 8888 (internal)
│   └── Depends on: PostgreSQL
├── merkle-dashboard
│   ├── Build: Vite build → static files
│   ├── Output: /app/apps/merkle-dashboard/dist
│   └── Mounts: Named volume 'dashboard-dist'
├── caddy (Reverse Proxy)
│   ├── Ports: 80, 443 (external)
│   ├── Routes:
│   │   ├── / → merkle-pay (payment form)
│   │   ├── /api → merkle-pay (backend API)
│   │   └── /dashboard → dashboard-dist (static files)
│   └── SSL: Automatic (Let's Encrypt)
└── PostgreSQL (shared database)
    └── Persists data across restarts

Networks: merkle-network (bridge)
Volumes: dashboard-dist (build output)
```

### Starting Production

```bash
# Build and start all services
docker compose up -d

# Or using make
make d-up
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f merkle-pay
docker compose logs -f caddy
```

### Stopping Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

## Caddy Configuration

**File:** `caddy/Caddyfile`

### Routing Rules

```
{domain} {
    # Payment form and pages
    route / {
        reverse_proxy merkle-pay:8888
    }

    # Backend API
    route /api/* {
        reverse_proxy merkle-pay:8888
    }

    # Admin dashboard (static files)
    route /dashboard/* {
        root * /srv/dashboard
        try_files {path} /dashboard/index.html
        file_server
    }

    # SSL/TLS
    tls {
        # Automatic HTTPS via Let's Encrypt
    }
}
```

### Features

- **Automatic HTTPS:** Let's Encrypt SSL certificates
- **Reverse Proxy:** Routes requests to appropriate services
- **Static File Serving:** Serves dashboard SPA
- **SPA Routing:** Handles client-side routing for dashboard

## Environment Configuration

### Production Environment Variables

**File:** `.env`

```bash
# Application
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@postgres:5432/merkle_pay

# JWT
JWT_SECRET=<strong-secret-key>
JWT_ISSUER="Merkle Pay"

# Blockchain
NEXT_PUBLIC_BLOCKCHAIN_OPTIONS=solana,base
NEXT_PUBLIC_SOLANA_WALLETS=<production-wallets>
NEXT_PUBLIC_SOLANA_TOKEN_OPTIONS=USDT,USDC,SOL
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com

# Or use a premium RPC for better performance
# NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://rpc.helius.xyz/?api-key=<key>

# Security
TURNSTILE_SECRET_KEY=<cloudflare-secret>
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<cloudflare-public>

# Auth
ENABLE_SIGNUP=NO  # Disable public signup in production

# Domain
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Environment Variable Conventions

**Naming:**
- `NEXT_PUBLIC_*`: Exposed to frontend (Next.js/Vite)
- `VITE_*`: Vite-specific variables
- Other: Backend-only secrets

**Security:**
- Never commit `.env` to version control
- Use strong, random values for secrets
- Rotate keys regularly
- Use different values for production vs staging

## Database Setup

### PostgreSQL Configuration

**Using Neon (Recommended for Production):**

```bash
# Create database on Neon.tech
# Copy connection string

DATABASE_URL=postgresql://user:password@host.region.neon.tech/dbname?sslmode=require
```

**Using Self-Hosted PostgreSQL:**

```yaml
# In compose.yml
postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: merklepay
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    POSTGRES_DB: merkle_pay
  volumes:
    - postgres_data:/var/lib/postgresql/data
  networks:
    - merkle-network
```

### Running Migrations

```bash
# From merkle-pay app directory
cd apps/merkle-pay

# Run database migrations
pnpm db:migrate

# Or run SQL files manually
psql $DATABASE_URL -f src/database/migrations/YYYYMMDD_migration_name.sql
```

### Backup and Restore

**Backup:**

```bash
# Manual backup
docker compose exec postgres pg_dump -U merklepay merkle_pay > backup.sql

# Automated backup (cron job)
0 2 * * * docker compose exec postgres pg_dump -U merklepay merkle_pay > /backups/merkle_pay_$(date +\%Y\%m\%d).sql
```

**Restore:**

```bash
# Restore from backup
docker compose exec -T postgres psql -U merklepay merkle_pay < backup.sql
```

## Deployment Workflows

### Initial Deployment

1. **Prepare Server**

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin
```

2. **Clone Repository**

```bash
git clone https://github.com/yourusername/merkle-pay.git
cd merkle-pay
```

3. **Configure Environment**

```bash
cp .env.example .env
nano .env  # Edit with production values
```

4. **Build and Start**

```bash
docker compose up -d --build
```

5. **Run Database Migrations**

```bash
docker compose exec merkle-pay pnpm db:migrate

# Or run SQL files directly
docker compose exec postgres psql -U merklepay merkle_pay -f /app/src/database/migrations/latest.sql
```

6. **Verify Deployment**

```bash
# Check all services are running
docker compose ps

# Check logs
docker compose logs -f
```

### Updates and Releases

1. **Pull Latest Changes**

```bash
git pull origin main
```

2. **Rebuild and Restart**

```bash
# Rebuild only changed services
docker compose up -d --build

# Or rebuild everything
docker compose down
docker compose up -d --build
```

3. **Run New Migrations (if any)**

```bash
docker compose exec merkle-pay pnpm db:migrate

# Or check and run specific migration files
docker compose exec postgres psql -U merklepay merkle_pay -f /app/src/database/migrations/YYYYMMDD_migration.sql
```

### Zero-Downtime Deployment

For production systems requiring zero downtime:

1. **Use Blue-Green Deployment:**

```bash
# Start new version alongside old
docker compose -p merkle-pay-blue up -d

# Test new version
curl http://localhost:8889/api/health

# Switch Caddy to point to new version
# Update Caddyfile and reload

# Stop old version
docker compose -p merkle-pay-green down
```

2. **Use Rolling Updates:**

```bash
# Update with rolling restart
docker compose up -d --no-deps --build merkle-pay
```

## Monitoring and Logging

### Docker Logs

```bash
# Real-time logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100

# Service-specific logs
docker compose logs -f merkle-pay
```

### Application Logs

**Next.js:**
- Logs written to stdout/stderr
- Captured by Docker

**Caddy:**
- Access logs: `/var/log/caddy/access.log`
- Error logs: `/var/log/caddy/error.log`

### Health Checks

Add health check endpoints:

```typescript
// apps/merkle-pay/src/app/api/health/route.ts
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
```

Monitor:

```bash
# Check health
curl https://yourdomain.com/api/health

# Automated monitoring (add to cron)
*/5 * * * * curl -f https://yourdomain.com/api/health || echo "Health check failed" | mail -s "Alert" admin@yourdomain.com
```

## Performance Optimization

### Next.js Build Optimization

```javascript
// apps/merkle-pay/next.config.ts
export default {
  output: 'standalone',
  compress: true,
  swcMinify: true,
  images: {
    domains: ['yourdomain.com'],
  },
};
```

### Caddy Caching

```
{domain} {
    # Cache static assets
    @static {
        path *.js *.css *.png *.jpg *.svg *.woff *.woff2
    }
    header @static Cache-Control "public, max-age=31536000, immutable"

    # Other routes...
}
```

### Database Connection Pooling

```bash
# Use Neon or PgBouncer for connection pooling
DATABASE_URL=postgresql://user:password@pooler.region.neon.tech/dbname?sslmode=require
```

## Security Hardening

### Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### SSL/TLS Configuration

Caddy automatically handles SSL certificates via Let's Encrypt. For custom certificates:

```
{domain} {
    tls /path/to/cert.pem /path/to/key.pem
}
```

### Secrets Management

**Using Docker Secrets:**

```yaml
secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  db_password:
    file: ./secrets/db_password.txt

services:
  merkle-pay:
    secrets:
      - jwt_secret
      - db_password
```

**Using Environment Files:**

```bash
# Store in secure location
/opt/merkle-pay/.env.production

# Reference in compose
env_file:
  - /opt/merkle-pay/.env.production
```

## Backup Strategy

### Automated Backups

```bash
#!/bin/bash
# /opt/merkle-pay/backup.sh

BACKUP_DIR="/backups/merkle-pay"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
docker compose exec -T postgres pg_dump -U merklepay merkle_pay > "$BACKUP_DIR/db_$DATE.sql"

# Keep only last 30 days
find "$BACKUP_DIR" -name "db_*.sql" -mtime +30 -delete

# Upload to S3 (optional)
# aws s3 cp "$BACKUP_DIR/db_$DATE.sql" s3://your-bucket/backups/
```

Add to cron:

```bash
# Run daily at 2 AM
0 2 * * * /opt/merkle-pay/backup.sh
```

## Scaling Considerations

### Horizontal Scaling

For high-traffic deployments:

1. **Load Balancer:** Add nginx or HAProxy in front of multiple Caddy instances
2. **Multiple App Instances:** Run multiple merkle-pay containers
3. **Database Read Replicas:** PostgreSQL replication for read-heavy workloads
4. **CDN:** Use CloudFlare or similar for static assets

### Vertical Scaling

Adjust Docker resource limits:

```yaml
services:
  merkle-pay:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

## Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| **Environment** | `make dev` on localhost | Docker Compose |
| **Ports** | 8888 (pay), 9999 (dashboard) | 80, 443 (Caddy) |
| **SSL** | No SSL | Automatic HTTPS |
| **Database** | Local PostgreSQL or Neon | Production PostgreSQL |
| **CORS** | Permissive | Restricted |
| **Signup** | ENABLE_SIGNUP=YES | ENABLE_SIGNUP=NO |
| **Error Reporting** | Verbose | Production-safe |

## Troubleshooting

### Common Issues

**Container Won't Start:**
```bash
# Check logs
docker compose logs merkle-pay

# Check configuration
docker compose config
```

**Database Connection Failed:**
```bash
# Verify DATABASE_URL
# Check network connectivity
docker compose exec merkle-pay ping postgres
```

**SSL Certificate Issues:**
```bash
# Check Caddy logs
docker compose logs caddy

# Verify domain DNS
nslookup yourdomain.com
```

**High Memory Usage:**
```bash
# Check container stats
docker stats

# Adjust resource limits in compose.yml
```

## Related Documentation

- [Development Guide](./DEVELOPMENT.md) - Local development setup
- [API Reference](./API.md) - API endpoints
- [Security](./SECURITY.md) - Security best practices
- [Architecture Summary](./ARCHITECTURE_SUMMARY.md) - System overview
