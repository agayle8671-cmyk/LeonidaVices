# Test Credentials — Honest John's Travel Agency

## Admin Account
- Username: `honest_john`
- Password: `leonida2026`
- Role: admin
- Access: /moderation panel, all admin API endpoints

## API Endpoints
- Base URL: https://geospatial-leonida.preview.emergentagent.com/api
- POST /api/auth/register - { username, password }
- POST /api/auth/login - { username, password } → returns { token, user }
- GET /api/auth/me - requires Bearer token
- GET /api/community/pois - public
- POST /api/community/pois - requires Bearer token
- POST /api/community/pois/{id}/upvote - requires Bearer token
- POST /api/community/pois/{id}/flag - requires Bearer token
- DELETE /api/community/pois/{id} - requires Bearer token (owner or admin)
- GET /api/admin/pois - admin only
- PUT /api/admin/pois/{id}/approve - admin only
- DELETE /api/admin/pois/{id}/admin - admin only
- GET /api/leaderboard - public
- GET /api/users/{user_id}/stats - public

## Authentication
- JWT tokens stored in localStorage as 'hj_token'
- Sent as Authorization: Bearer <token> header
- Token expires in 30 days
