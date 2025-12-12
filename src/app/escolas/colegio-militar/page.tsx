import Image from "next/image";
import Header from "@/components/sections/header";

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Header />
      <section className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <h1 className="text-3xl md:text-4xl font-semibold">Produtos</h1>
      </section>
    </main>
  );
}