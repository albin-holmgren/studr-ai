import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/node";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import ReactMarkdown from "react-markdown";
import { usePageTitle } from "~/hooks/use-page-title";
import { usePageEmoji } from "~/hooks/use-page-emoji";
import { Layout } from "~/components/layout";
import { Editor } from "~/components/editor";

export const loader: LoaderFunction = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.resolve(__dirname, "../../GETTING_STARTED.md");
  const content = await fs.readFile(filePath, "utf-8");
  return json({ content });
};

export default function GettingStarted() {
  const { title, setTitle } = usePageTitle("getting-started");
  const { emoji, setEmoji } = usePageEmoji("getting-started");

  const content = `# Getting Started with Studr

Welcome to Studr! This guide will help you get started with our application and make the most out of its features.

## Overview

Studr is a powerful application designed to help you manage your documents and workspaces efficiently. Whether you're organizing personal notes or collaborating with a team, Studr provides the tools you need to stay organized and productive.

## Key Features

- **Document Management**: Create, update, and organize your documents with ease.
- **Workspaces**: Collaborate with others by creating shared workspaces.
- **Authentication**: Securely log in to access your personalized content.
- **Favorites**: Keep track of your most important documents by adding them to your favorites.
- **Analytics**: Gain insights into your document usage and activity.

## Getting Started

1. **Sign Up or Log In**
   - If you're new to Studr, sign up to create an account. If you already have an account, log in to access your dashboard.

2. **Create a Workspace**
   - Start by creating a workspace for your projects. Workspaces allow you to group related documents together and collaborate with others.

3. **Add Documents**
   - Within a workspace, you can create new documents or upload existing ones. Use the editor to write and format your content.

4. **Organize Your Documents**
   - Use folders and tags to organize your documents for easy access. Add important documents to your favorites for quick retrieval.

5. **Explore Features**
   - Take advantage of Studr's features such as analytics to track your document usage and activity.

## Support

If you have any questions or need assistance, our support team is here to help. Visit our [support page](#) or contact us at support@studr.com.

Thank you for choosing Studr! We hope you enjoy using our application.`;

  return (
    <Layout 
      title={title} 
      emoji={emoji}
      onTitleChange={setTitle}
      onEmojiChange={setEmoji}
    >
      <Editor title={title} onTitleChange={setTitle} />
      <div className="prose mx-auto p-4">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </Layout>
  );
}
