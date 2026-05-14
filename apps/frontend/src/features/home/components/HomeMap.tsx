"use client"

export default function HomeMap() {
  return (
    <section className="container mx-auto px-6 space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-[#f26522] pb-2 px-8">
          แผนผัง
        </h2>
      </div>

      {/* Map/Layout Image Container */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="aspect-[16/9] w-full bg-gray-100 flex items-center justify-center p-12">
          {/* Placeholder for the Layout/Map Image */}
          <div className="w-full h-full bg-[#f8f8f8] rounded-2xl border border-gray-200 flex items-center justify-center">
             <p className="text-gray-400 font-medium italic">Layout / Map Content Placeholder</p>
          </div>
        </div>
      </div>
    </section>
  );
}
