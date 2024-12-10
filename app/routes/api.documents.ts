import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { prisma } from "~/lib/db.server";
import { requireUser } from "~/lib/session.server";
import { nanoid } from "nanoid";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const user = await requireUser(request);
    const url = new URL(request.url);
    const parentId = url.searchParams.get("parentId");

    const documents = await prisma.document.findMany({
      where: {
        userId: user.id,
        isArchived: false,
        isDeleted: false,
        parentId: parentId || null,
      },
      select: {
        id: true,
        title: true,
        emoji: true,
        parentId: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc'
      },
    });

    return json(documents);
  } catch (error) {
    console.error("Error loading documents:", error);
    throw json({ error: "Failed to load documents" }, { status: 500 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const user = await requireUser(request);
    console.log("[api.documents] User authenticated:", { userId: user.id, email: user.email });

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }

    const formData = await request.formData();
    const parentId = formData.get("parentId") as string;
    console.log("[api.documents] Creating document:", { parentId });

    // Verify parent if provided
    if (parentId) {
      const parent = await prisma.document.findFirst({
        where: { 
          id: parentId,
          userId: user.id,
          isDeleted: false,
          isArchived: false
        },
      });
      
      if (!parent) {
        console.error("[api.documents] Parent document not found or inaccessible");
        return json({ error: "Parent document not found" }, { status: 404 });
      }
    }

    // Generate document ID
    const timestamp = Date.now();
    const randomId = nanoid(10);
    const documentId = `page-${timestamp}-${randomId}`;
    console.log("[api.documents] Generated document ID:", { documentId });

    try {
      // Create the document with a transaction to ensure atomicity
      const document = await prisma.$transaction(async (tx) => {
        // Create the document
        const doc = await tx.document.create({
          data: {
            id: documentId,
            userId: user.id,
            parentId: parentId || null,
            title: "Untitled",
            emoji: "📄",
            content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
            isArchived: false,
            isDeleted: false,
            isStarred: false,
          },
        });

        return doc;
      });

      // Verify the document was created
      const verifyDoc = await prisma.document.findUnique({
        where: { 
          id: documentId,
        },
        select: {
          id: true,
          title: true,
          emoji: true,
          parentId: true,
          updatedAt: true,
        },
      });

      if (!verifyDoc) {
        console.error("[api.documents] Document verification failed after creation");
        throw new Error("Document creation verification failed");
      }

      console.log("[api.documents] Document created successfully:", {
        documentId: verifyDoc.id,
        title: verifyDoc.title,
        parentId: verifyDoc.parentId,
      });

      return json({ document: verifyDoc });
    } catch (error) {
      console.error("[api.documents] Error in document creation transaction:", error);
      throw error;
    }
  } catch (error) {
    console.error("[api.documents] Error in action:", error);
    return json(
      { error: "Failed to create document. Please try again." },
      { status: 500 }
    );
  }
};
