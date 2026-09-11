# Project Guidelines

## Development

This project uses Go 1.25.1 and follows standard Go conventions.

### Key Patterns
- Use transactions for all financial operations
- Apply rate limiting to sensitive endpoints
- Validate input thoroughly
- Use parameterized queries to prevent SQL injection

### Security
- All secrets must be configured via environment variables
- No default fallback values for authentication secrets
- Use constant-time comparison for secret validation