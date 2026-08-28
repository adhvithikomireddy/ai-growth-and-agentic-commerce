# Production Deployment & External Services Guide

This guide provides step-by-step instructions for deploying NexCommerce to production hosting providers (such as Vercel for the frontend and Render/Railway/Fly.io for the backend) connected to your own persistent MongoDB Atlas cluster and Razorpay TEST MODE account.

---

## 1. Credentials & External Services Checklist

| Service | Environment Variable | Location | Purpose |
| :--- | :--- | :--- | :--- |
| **MongoDB Atlas** | `MONGODB_URI` | Backend ONLY | Persistent storage for users, products, orders, A2A logs |
| **Razorpay (Public)** | `RAZORPAY_KEY_ID` / `VITE_RAZORPAY_KEY_ID` | Backend & Frontend | Razorpay Standard Checkout in TEST MODE |
| **Razorpay (Secret)** | `RAZORPAY_KEY_SECRET` | Backend ONLY | Server-side HMAC-SHA256 payment signature verification |
| **JWT Secret** | `JWT_SECRET` | Backend ONLY | Signing and verifying user session tokens (min 32 chars) |
| **Gemini AI (Optional)** | `GEMINI_API_KEY` | Backend ONLY | External LLM. If omitted, built-in Deterministic Engine activates |
| **Client URL** | `CLIENT_URL` | Backend ONLY | Configures CORS to permit only your deployed frontend |
| **Backend API URL** | `VITE_API_URL` | Frontend ONLY | Points frontend fetch calls to your deployed backend |

---

## 2. Step-by-Step Deployment Instructions

### Step A: Configure MongoDB Atlas
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Security > Database Access**, create a database user with read/write privileges.
3. Under **Security > Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere) so your cloud hosting provider can connect.
4. Under **Database > Connect > Drivers**, copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ai_agentic_commerce?retryWrites=true&w=majority
   ```

### Step B: Configure Razorpay TEST MODE
1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Toggle the switch at the top to **TEST MODE**.
3. Navigate to **Account & Settings > API Keys > Generate Key**.
4. Copy `Key ID` (starts with `rzp_test_...`) and `Key Secret`.

### Step C: Deploy Backend (Render / Railway)
1. Push this repository to your GitHub account.
2. In Render / Railway, select **New Web Service** and connect your repository.
3. Configure the build settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI=<Your MongoDB Atlas connection string>`
   - `JWT_SECRET=<Random 32-character string>`
   - `RAZORPAY_KEY_ID=<Your Razorpay Test Key ID>`
   - `RAZORPAY_KEY_SECRET=<Your Razorpay Test Key Secret>`
   - `GEMINI_API_KEY=<Your Gemini API Key (optional)>`
   - `CLIENT_URL=https://<your-frontend-domain>.vercel.app`
5. Deploy and run seed:
   - Once deployed, open the Render / Railway shell and run:
     ```bash
     npm run seed
     ```
   - Verify health check: `https://<your-backend-domain>/health`

### Step D: Deploy Frontend (Vercel / Netlify)
1. In Vercel, select **Add New > Project** and import the repository.
2. Configure settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variables:
   - `VITE_API_URL=https://<your-backend-domain>`
   - `VITE_RAZORPAY_KEY_ID=<Your Razorpay Test Key ID>`
4. Deploy the frontend.

---

## 3. Production Verification Checklist

- [ ] `GET /health` returns `{"status":"ok", "database":{"connected":true}}`
- [ ] User signup and login succeed with JWT stored securely
- [ ] Restarting backend does NOT wipe users or placed orders (verified in MongoDB Atlas)
- [ ] AI-readable catalog returns products at `/api/agent/catalog/capabilities`
- [ ] Natural language queries in English, Hindi, and Telugu return accurate recommendations
- [ ] Bounded negotiation enforces store-level discount ceiling (<= 10%)
- [ ] Autonomous spending controls require PIN above threshold
- [ ] Razorpay TEST payment completes and backend HMAC-SHA256 signature verifies
- [ ] Official downloadable/printable receipt is generated with payment transaction ID
