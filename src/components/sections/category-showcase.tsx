import Link from 'next/link';

const CategoryShowcase = () => {
  return (
    <section className="px-[15px] xll:px-[30px] my-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Men Section */}
        <Link href="/men" className="block">
          <div className="relative group overflow-hidden rounded-[14px] min-h-[400px] md:min-h-[500px] lg:h-[75vh] w-full">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              style={{
                backgroundColor: '#E8E8E8'
              }}
              aria-label="An image for the Men's collection category, showing a male model."
              role="img" />

            <div className="absolute bottom-6 left-6">
              <h2 className="text-black !whitespace-pre-line">Empresarial</h2>
            </div>
          </div>
        </Link>

        {/* Gifts Section */}
        <Link href="/gifts" className="block">
          <div className="relative group overflow-hidden rounded-[14px] min-h-[400px] md:min-h-[500px] lg:h-[75vh] w-full bg-white border flex items-center justify-center">
            <div className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
              <h2 className="text-black !whitespace-pre-line"></h2>
            </div>
          </div>
        </Link>
      </div>
    </section>);

};

export default CategoryShowcase;