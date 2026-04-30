# Taskpilot Deployment Guide 🚀

Deploying your project involves putting your frontend, backend, and database on the internet so anyone can access it. Since your project is already set up with a `vercel.json` file, **Vercel** is the easiest platform to deploy this full-stack app.

Here is the step-by-step process.

---

## Step 1: Set up a Cloud Database (MongoDB Atlas)

Your app currently uses a local database (`mongodb://localhost:27017`). For the internet to access it, you need a cloud database.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Build a new cluster (the free **M0 Sandbox** is perfect).
3. Under **Database Access**, create a new database user with a username and password. Remember this password!
4. Under **Network Access**, click "Add IP Address", and select **"Allow Access from Anywhere"** (`0.0.0.0/0`).
5. Go to your **Database** page, click **Connect**, choose **Drivers**, and copy the connection string.
   - It will look like this: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with the password you just created.

---

## Step 2: Push Your Code to GitHub

Vercel deploys directly from your GitHub repository.

1. If you haven't already, create a free account on [GitHub](https://github.com/).
2. Create a new repository (you can name it `taskpilot`).
3. Open your terminal in the `Taskpilot` directory (`c:\Users\M S I\Taskpilot`) and run the following commands to push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/taskpilot.git
   git push -u origin main
   ```
   *(Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username)*

---

## Step 3: Deploy on Vercel

1. Go to [Vercel](https://vercel.com/) and sign up using your GitHub account.
2. Click **"Add New Project"** and select your `taskpilot` repository from GitHub.
3. In the **Configure Project** screen:
   - **Framework Preset**: Leave it as **Other**.
   - **Root Directory**: Leave it as the default (`./`).
4. Open the **Environment Variables** section and add the variables from your `backend/.env` file:
   - `JWT_SECRET`: `supersecretkey123` (or generate a more secure one)
   - `EMAIL_USER`: `raushankumar261186@gmail.com`
   - `EMAIL_PASS`: `rmfm rvtg jdtg yndp`
   - `MONGO_URI`: **Paste your MongoDB Atlas connection string from Step 1 here.**
   - `GOOGLE_CLIENT_ID`: (Your Google Client ID)
   - `GOOGLE_CLIENT_SECRET`: (Your Google Client Secret)
   - `google_callback_url`: We'll update this shortly.
5. Click **Deploy**. Vercel will now install dependencies and build both your frontend and backend.
   *(Note: I've updated your root `package.json` to automatically build your frontend during this step!)*

---

## Step 4: Update Google OAuth Settings

Once Vercel gives you a deployed URL (e.g., `https://taskpilot.vercel.app`):

1. Go back to Vercel's **Environment Variables** for your project, and update `google_callback_url` to be your new domain (e.g., `https://taskpilot.vercel.app`).
2. Go to your [Google Cloud Console](https://console.cloud.google.com/).
3. Navigate to **APIs & Services > Credentials**.
4. Edit your OAuth 2.0 Client ID.
5. Under **Authorized JavaScript origins**, add your new Vercel domain (`https://taskpilot.vercel.app`).
6. Under **Authorized redirect URIs**, add the callback URL endpoint (this should match whatever route your backend expects for the callback, likely the root domain).

> [!SUCCESS]
> You're done! Your app should now be fully functional and live on the internet!
