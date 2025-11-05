# Merkle Pay Documentation

Welcome to the Merkle Pay documentation. This directory contains detailed guides and references for working with the Merkle Pay monorepo.

## Quick Navigation

### For Developers

- **Getting Started:** [Development Guide](./DEVELOPMENT.md)
- **Adding Features:** [Development Guide - Common Workflows](./DEVELOPMENT.md#common-workflows)
- **Understanding the Code:** [Architecture Summary](./ARCHITECTURE_SUMMARY.md)

### For System Architects

- **Overall Architecture:** [Architecture Summary](./ARCHITECTURE_SUMMARY.md)
- **Database Design:** [Database Architecture](./DATABASE.md)
- **API Design:** [API Reference](./API.md)
- **Payment Processing:** [Payment Flow](./PAYMENT_FLOW.md)

### For DevOps

- **Deployment:** [Deployment Guide](./DEPLOYMENT.md)
- **Security:** [Security Guide](./SECURITY.md)
- **Monitoring:** [Deployment Guide - Monitoring](./DEPLOYMENT.md#monitoring-and-logging)

## Documentation Index

### [Architecture Summary](./ARCHITECTURE_SUMMARY.md)
High-level overview of the Merkle Pay system architecture, applications, and tech stack.

**Topics:**
- Monorepo structure
- Application overview
- Tech stack summary
- Directory organization

### [Database Architecture](./DATABASE.md)
Complete database schema documentation including all models and design patterns.

**Topics:**
- PostgreSQL schema (SQL CREATE TABLE statements)
- Core models (Payment, Boss, Business, Token)
- Payment status state machine
- Database design patterns
- SQL migration management
- Direct SQL query examples

### [Payment Flow](./PAYMENT_FLOW.md)
Detailed explanation of payment flows for different blockchain integrations.

**Topics:**
- Solana payment flow
- EVM payment flow (in progress)
- Transaction parameters
- Token configuration
- Wallet integration (Phantom, MetaMask)
- Status tracking and confirmation

### [API Reference](./API.md)
Complete API documentation including authentication, endpoints, and response formats.

**Topics:**
- Authentication flow (JWT)
- Payment endpoints
- Dashboard endpoints
- Authentication endpoints
- Request/response formats
- Middleware & CORS
- Validation patterns

### [Development Guide](./DEVELOPMENT.md)
Everything you need to know for local development and contributing to the project.

**Topics:**
- Initial setup
- Running dev servers
- Common workflows (adding endpoints, features, blockchain support)
- Database schema changes
- Testing
- Debugging
- Troubleshooting

### [Deployment Guide](./DEPLOYMENT.md)
Production deployment and infrastructure documentation.

**Topics:**
- Docker Compose setup
- Caddy configuration
- Environment variables
- Database setup
- Deployment workflows
- Monitoring and logging
- Backup strategies
- Scaling considerations

### [Security Guide](./SECURITY.md)
Security best practices and implementation details.

**Topics:**
- Authentication & authorization
- Input validation
- Password security
- SQL injection prevention
- XSS prevention
- CSRF protection
- Bot protection (Turnstile)
- Transaction security
- Secrets management
- Security headers

## Document Relationships

```
ARCHITECTURE_SUMMARY.md (Start Here)
    ├── DATABASE.md (Data Layer)
    ├── API.md (Application Layer)
    │   └── SECURITY.md (Cross-cutting)
    ├── PAYMENT_FLOW.md (Business Logic)
    │   └── SECURITY.md (Cross-cutting)
    ├── DEVELOPMENT.md (Dev Workflow)
    └── DEPLOYMENT.md (Infrastructure)
        └── SECURITY.md (Cross-cutting)
```

## Contributing to Documentation

When updating documentation:

1. **Keep it synchronized:** Update related docs when making changes
2. **Add cross-references:** Link to related sections in other docs
3. **Include examples:** Show code examples for technical concepts
4. **Update timestamps:** Note recent changes at the top of files
5. **Test links:** Ensure all internal links work correctly

## Getting Help

- **For code questions:** See [Development Guide](./DEVELOPMENT.md)
- **For security questions:** See [Security Guide](./SECURITY.md)
- **For deployment questions:** See [Deployment Guide](./DEPLOYMENT.md)
- **For API questions:** See [API Reference](./API.md)

## External Resources

### Frameworks & Libraries
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres Documentation](https://node-postgres.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [TanStack Router](https://tanstack.com/router/latest)

### Blockchain
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Solana Pay](https://solanapay.com/)
- [Solana Explorer](https://explorer.solana.com/)

### Tools
- [Phantom Wallet](https://phantom.app)
- [Caddy Server](https://caddyserver.com/docs/)
