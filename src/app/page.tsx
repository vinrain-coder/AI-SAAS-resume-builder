import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-50 px-6 py-12 text-gray-900 md:gap-12">
      {/* Logo */}
      <div className="flex justify-center">
        <Image src={logo} alt="Logo" width={180} height={180} />
      </div>

      {/* Text Section */}
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Create the{" "}
          <span className="bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
            Perfect Resume
          </span>{" "}
          in Minutes
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          Our <span className="font-semibold">AI-powered resume builder</span>{" "}
          helps you craft a professional resume effortlessly.
        </p>

        {/* CTA Button */}
        <div className="mt-6">
          <Button
            asChild
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg px-6 py-4 text-lg"
          >
            <Link href="/resumes">Get Started</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
