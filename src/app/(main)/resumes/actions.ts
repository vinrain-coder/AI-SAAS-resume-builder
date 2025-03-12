"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function deleteResume(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const resume = await prisma.resume.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  try {
    if (resume.photoUrl) {
      await del(resume.photoUrl);
      console.log("Deleted photo from blob storage:", resume.photoUrl);
    }

    await prisma.resume.delete({
      where: { id },
    });

    console.log("Resume deleted successfully:", id);
    revalidatePath("/resumes");
  } catch (error) {
    console.error("Error deleting resume:", error);
    throw new Error("Failed to delete resume");
  }
}
