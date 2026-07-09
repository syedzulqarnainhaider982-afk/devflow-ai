import Navbar from "@/components/layout/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="p-10">
        <h1 className="text-4xl font-bold">
          Test Page
        </h1>
        <p>
          Navbar testing ke liye ye page hai.
        </p>
      </main>
    </>
  );
}
