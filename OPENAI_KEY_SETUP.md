# OpenAI API Key Setup Guide

## How to Store Your OpenAI API Key Securely

Your OpenAI API key will be stored as a **Firebase Secret** (not in code or environment files). This keeps it secure on the server side.

## Step-by-Step Instructions

### 1. Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Set the OpenAI API Key as a Secret

Run this command in your terminal:

```bash
firebase functions:secrets:set OPENAI_API_KEY
```

When prompted, paste your OpenAI API key from https://platform.openai.com/api-keys

**Note:** The key won't be visible as you type it for security reasons.

### 4. Deploy the Secret Access

After setting the secret, deploy it:

```bash
firebase deploy --only functions:generateSurveyQuestions
```

This command grants the function permission to access the secret.

### 5. Deploy Your Functions

Build and deploy the functions:

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

## Verify Setup

After deployment, you can verify the function is using the secret:

```bash
firebase functions:log
```

Look for logs showing successful AI-generated questions (or fallback messages if the key isn't set).

## How It Works

- The API key is stored in **Google Cloud Secret Manager**
- It's only accessible by your Firebase Functions
- Never exposed to the client-side code
- Automatically injected into your function's environment

## Troubleshooting

### If the function fails to find the key:

1. Check that the secret exists:
   ```bash
   firebase functions:secrets:access OPENAI_API_KEY
   ```

2. Ensure the function has been deployed after setting the secret:
   ```bash
   firebase deploy --only functions:generateSurveyQuestions
   ```

### If you need to update the API key:

```bash
firebase functions:secrets:set OPENAI_API_KEY
# Enter new key when prompted
firebase deploy --only functions:generateSurveyQuestions
```

### If you want to remove the secret:

```bash
firebase functions:secrets:destroy OPENAI_API_KEY
```

## Important Notes

- ✅ **DO**: Store API keys as Firebase Secrets
- ✅ **DO**: Use the secret name `OPENAI_API_KEY` exactly as defined in code
- ❌ **DON'T**: Put API keys in `.env` files
- ❌ **DON'T**: Hardcode API keys in source code
- ❌ **DON'T**: Share API keys in version control

## Testing Without an API Key

If you don't set an API key, the function will automatically use intelligent fallback templates with Likert scale questions. The function will still work, just without AI-generated questions.
