# /deploy — Build & Deploy to Staging/Production

Builds Docker images and pushes to deployment platform.

**Usage:**
```
/deploy --staging      # Deploy to staging environment
/deploy --prod         # Deploy to production (requires approval)
/deploy --backend      # Backend only
/deploy --mobile       # Mobile only (EAS build)
```

**Process:**
1. Run full test suite (`/test-all`)
2. Build Docker images
3. Push to registry
4. Deploy to Railway/Render
5. Run smoke tests
6. Notify team on Slack

**Requirements:**
- All tests pass
- No CRITICAL security issues
- Commit message includes version bump

**Output:**
- Deployment logs
- Health check results
- Rollback instructions (if needed)

**Used by:** CD/CD pipeline, production releases
