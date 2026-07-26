# Testing FoodShare

This project favors fast, practical verification over heavy test tooling,
since the deliverable is a working full-stack app wired to real AWS services.
Below are the steps to verify every layer end-to-end.

## 1. Backend — local smoke test
```bash
cd backend
npm install
cp .env.example .env   # fill in AWS_REGION, JWT_SECRET, table/bucket/topic names
node scripts/createTables.js
npm run dev
```
Health check:
```bash
curl http://localhost:5000/api/health
# {"success":true,"message":"FoodShare API is running", ...}
```

## 2. Auth flow (curl)
```bash
# Register a donor
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Donor","email":"donor@test.com","password":"password123","role":"donor"}'

# Register an NGO
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test NGO","email":"ngo@test.com","password":"password123","role":"ngo","organizationName":"Hope Foundation"}'

# Login (copy the "token" from the response)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"donor@test.com","password":"password123"}'
```

## 3. Donation flow (curl)
```bash
TOKEN_DONOR="<paste donor token>"
TOKEN_NGO="<paste ngo token>"

# Donor posts a donation with an image
curl -X POST http://localhost:5000/api/donations \
  -H "Authorization: Bearer $TOKEN_DONOR" \
  -F "foodName=Vegetable Biryani" \
  -F "quantity=Serves 20" \
  -F "category=Cooked Meals" \
  -F "pickupLocation=123 Main St" \
  -F "image=@/path/to/photo.jpg"

# NGO views available donations
curl http://localhost:5000/api/donations -H "Authorization: Bearer $TOKEN_NGO"

# NGO accepts a donation
curl -X PATCH http://localhost:5000/api/donations/<donationId>/accept \
  -H "Authorization: Bearer $TOKEN_NGO"

# NGO marks it completed
curl -X PATCH http://localhost:5000/api/donations/<donationId>/complete \
  -H "Authorization: Bearer $TOKEN_NGO"
```

## 4. Verify AWS integration
- **DynamoDB**: open the `FoodShare_Users` and `FoodShare_Donations` tables in
  the AWS Console and confirm the items above were written correctly, and that
  `status` transitions (`available` → `accepted` → `completed`) are reflected.
- **S3**: confirm the uploaded image appears under `donations/` in the bucket,
  and that `imageUrl` returned by the API loads in a browser.
- **SNS**: if you subscribed an email/SMS endpoint to the topic, confirm you
  receive notifications for registration, new donation, accept, and complete
  events.
- **CloudWatch Logs**: open log group `/foodshare/backend` and confirm request
  and event logs are streaming in (info logs for each request, error logs on
  failures).
- **IAM**: confirm the EC2 instance role has *only* the permissions in
  `backend/aws/iam-policy.json` — test that an unrelated AWS action (e.g.
  `dynamodb:DeleteTable`) is denied.

## 5. Frontend — local run
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:5000/api
npm run dev
```
Open `http://localhost:5173` and walk through:
1. Landing → About → Contact pages render and are responsive (resize to mobile width).
2. Register as a Donor → redirected to Donor Dashboard.
3. Post a donation with an image → appears in "My Donations".
4. Log out, register as an NGO → Available Donations shows the donor's post.
5. Accept it → status updates, donor's dashboard reflects "Accepted".
6. Mark it completed → status updates to "Completed" on both dashboards.
7. Log in as the seeded Admin (`node scripts/createAdmin.js`) → Admin Dashboard
   shows correct stats, user list, and donation list; block/unblock and delete
   a test user; confirm a blocked user cannot log in.
8. Edit Profile (name/phone/address/password) → changes persist after reload.

## 6. Manual QA checklist
- [ ] JWT-protected routes reject requests without a token (401)
- [ ] Role-restricted routes reject the wrong role (403) — e.g. a donor calling `/api/donations/:id/accept`
- [ ] Validation errors return 422 with field-level messages (e.g. missing `foodName`)
- [ ] Duplicate email registration returns 409
- [ ] Wrong password returns 401 without revealing which field was wrong
- [ ] Uploading a non-image file is rejected client- and server-side
- [ ] UI is usable at 375px (mobile), 768px (tablet), and 1280px (desktop) widths
- [ ] All fetches go through `frontend/src/api/*` (no direct `axios`/other libs)

## 7. Suggested next step: automated tests
For CI, the natural additions (not included by default to keep the delivered
codebase lean) would be:
- **Backend**: Jest + Supertest against the Express app, with the AWS SDK
  clients mocked via `aws-sdk-client-mock`.
- **Frontend**: Vitest + React Testing Library for component/page tests, with
  `fetch` mocked via `msw` (Mock Service Worker).
