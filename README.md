# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/8d9f90fd-e82e-46fe-8c9e-adedc0e8ab4b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8d9f90fd-e82e-46fe-8c9e-adedc0e8ab4b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Firebase (Authentication, Firestore, Storage, Functions)
- Redux Toolkit + Redux Saga
- OpenAI (optional - for AI-powered survey question generation)

## AI-Powered Survey Question Generation

This project includes an AI-powered feature to automatically generate up to 5 tailored survey questions based on your product description.

### Setup (Optional)

To enable AI question generation using OpenAI:

1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Store the API key securely using Firebase Secrets:

```bash
# Install firebase-tools if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set the OpenAI API key as a secret
firebase functions:secrets:set OPENAI_API_KEY

# When prompted, enter your OpenAI API key
```

3. Deploy the Firebase function:

```bash
firebase deploy --only functions
```

**Important**: The API key is stored securely on the server-side in Firebase Functions, not exposed to the client. The function will use fallback templates if the secret is not set.

If you don't provide an API key, the app will use intelligent fallback templates that are context-aware and use Likert scale questions by default.

### Features

- **Smart Question Generation**: Generate up to 5 contextually relevant questions based on product description
- **Likert Scale Support**: Automatically uses 5-point Likert scales for multiple choice questions
- **Customizable**: Generated questions can be edited, removed, or extended after generation
- **Type Variety**: Mix of short-answer and choice-based questions for comprehensive feedback
- **Fallback Mode**: Works without API key using intelligent template-based generation
- **Secure**: API keys are stored server-side and never exposed to clients

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8d9f90fd-e82e-46fe-8c9e-adedc0e8ab4b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
