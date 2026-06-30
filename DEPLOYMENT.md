# 🚀 Deployment Guide for Spenza

## Prerequisites

- Node.js 20+
- Docker (optional)
- Supabase account and project
- Domain name (for production)

## Environment Setup

1. **Copy environment variables:**

   ```bash
   cp .env.example .env
   ```

2. **Configure Supabase:**

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Set up database:**
   ```bash
   # Run the SQL schema in your Supabase SQL editor
   cat supabase-schema.sql
   ```

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Production Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

```bash
# Manual deployment
npx vercel --prod
```

### Option 2: Docker Deployment

```bash
# Build Docker image
docker build -t spenza .

# Run with Docker Compose
docker-compose up -d

# Or run standalone
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  spenza
```

### Option 3: Traditional VPS/Cloud

```bash
# Build application
npm run build

# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "spenza" -- start
pm2 startup
pm2 save
```

## Security Checklist

- [ ] Environment variables are not committed to git
- [ ] Supabase RLS policies are enabled
- [ ] HTTPS is configured
- [ ] Security headers are set
- [ ] Rate limiting is implemented
- [ ] Error logging is configured

## Performance Optimization

- [ ] Bundle analysis completed (`npm run analyze`)
- [ ] Images are optimized
- [ ] CDN is configured
- [ ] Caching headers are set
- [ ] Database queries are optimized

## Monitoring Setup

1. **Error Tracking:**

   - Set up Sentry or similar service
   - Configure error logging endpoint

2. **Performance Monitoring:**

   - Enable Web Vitals tracking
   - Set up custom metrics

3. **Health Checks:**
   - Configure `/api/health` endpoint monitoring
   - Set up uptime monitoring

## Backup Strategy

1. **Database Backups:**

   - Supabase provides automatic backups
   - Consider additional backup strategy for critical data

2. **Application Backups:**
   - Source code is in Git
   - Environment variables should be documented securely

## Scaling Considerations

1. **Database:**

   - Monitor Supabase usage and upgrade plan as needed
   - Consider read replicas for high traffic

2. **Application:**

   - Use CDN for static assets
   - Consider serverless deployment for auto-scaling

3. **Caching:**
   - Implement Redis for session storage and caching
   - Use Next.js built-in caching features

## Troubleshooting

### Common Issues

1. **Build Failures:**

   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

2. **Database Connection Issues:**

   - Check Supabase project status
   - Verify environment variables
   - Check network connectivity

3. **Performance Issues:**

   ```bash
   # Analyze bundle size
   npm run analyze

   # Check performance metrics
   npm run perf
   ```

### Logs and Debugging

```bash
# View application logs
docker logs spenza

# Check health status
curl http://localhost:3000/api/health

# Monitor performance
curl http://localhost:3000/api/metrics
```

## Support

For deployment issues:

1. Check the troubleshooting section above
2. Review application logs
3. Check Supabase dashboard for database issues
4. Verify environment configuration
