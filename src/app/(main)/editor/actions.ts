"use server";

import prisma from "@/lib/prisma";
import { resumeSchema, ResumeValues } from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import { del, put } from "@vercel/blob";

export async function saveResume(values: ResumeValues) {
  console.log("Received values:", values);

  const { id } = values;
  const { photo, workExperiences, educations, ...resumeValues } =
    resumeSchema.parse(values);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const existingResume = id
    ? await prisma.resume.findUnique({ where: { id, userId } })
    : null;

  if (id && !existingResume) {
    throw new Error("Resume not found");
  }

  let newPhotoUrl: string | null = existingResume?.photoUrl || null;

  // ✅ Check if a new photo file is being uploaded
  if (photo instanceof File) {
    console.log("Uploading new photo:", photo.name);

    try {
      // Generate unique filename
      const fileExt = photo.name.split(".").pop();
      const fileName = `resume_photos/${userId}-${Date.now()}.${fileExt}`;

      // Delete old photo if exists
      if (existingResume?.photoUrl) {
        await del(existingResume.photoUrl);
        console.log("Deleted old photo:", existingResume.photoUrl);
      }

      // Upload new photo
      const blob = await put(fileName, photo, {
        access: "public",
      });

      newPhotoUrl = blob.url;
      console.log("New photo uploaded:", newPhotoUrl);
    } catch (error) {
      console.error("Photo upload failed:", error);
      throw new Error("Failed to upload resume photo");
    }
  } else if (photo === null && existingResume?.photoUrl) {
    // ✅ If `photo` is `null`, delete the existing photo
    await del(existingResume.photoUrl);
    console.log("Photo removed for resume:", id);
    newPhotoUrl = null;
  }

  try {
    if (id) {
      console.log("Updating existing resume:", id);
      return await prisma.resume.update({
        where: { id },
        data: {
          ...resumeValues,
          photoUrl: newPhotoUrl,
          workExperiences: {
            deleteMany: {},
            create: workExperiences?.map((exp) => ({
              ...exp,
              startDate: exp.startDate ? new Date(exp.startDate) : undefined,
              endDate: exp.endDate ? new Date(exp.endDate) : undefined,
            })),
          },
          educations: {
            deleteMany: {},
            create: educations?.map((edu) => ({
              ...edu,
              startDate: edu.startDate ? new Date(edu.startDate) : undefined,
              endDate: edu.endDate ? new Date(edu.endDate) : undefined,
            })),
          },
          updatedAt: new Date(),
        },
      });
    } else {
      console.log("Creating new resume");
      return await prisma.resume.create({
        data: {
          ...resumeValues,
          userId,
          photoUrl: newPhotoUrl,
          workExperiences: {
            create: workExperiences?.map((exp) => ({
              ...exp,
              startDate: exp.startDate ? new Date(exp.startDate) : undefined,
              endDate: exp.endDate ? new Date(exp.endDate) : undefined,
            })),
          },
          educations: {
            create: educations?.map((edu) => ({
              ...edu,
              startDate: edu.startDate ? new Date(edu.startDate) : undefined,
              endDate: edu.endDate ? new Date(edu.endDate) : undefined,
            })),
          },
        },
      });
    }
  } catch (error) {
    console.error("Failed to save resume:", error);
    throw new Error("Failed to save resume");
  }
}
