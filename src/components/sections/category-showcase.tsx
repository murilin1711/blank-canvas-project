import Link from 'next/link';

const CategoryShowcase = () => {
  return (
    <section className="px-[15px] xll:px-[30px] my-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Men Section */}
        <Link href="/men" className="block">
          <div className="relative group overflow-hidden rounded-[14px] min-h-[300px] md:min-h-[350px] lg:h-[50vh] w-full">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              style={{
                backgroundImage: 'url(https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/grupo-de-homens-confiantes-em-uniformes-azuis-posando-em-um-cenario-de-fabrica-1765251165935.jpg?width=8000&height=8000&resize=contain)',
                backgroundColor: '#E8E8E8'
              }}
              aria-label="An image for the Men's collection category, showing a male model."
              role="img" />

            <div className="absolute bottom-6 left-6">
              <div className="bg-white rounded-lg px-4 py-2 shadow-md">
                <h3 style={{ color: '#2e3091' }}>Empresarial</h3>
              </div>
            </div>
          </div>
        </Link>

        {/* Gifts Section */}
        <Link href="/gifts" className="block">
          <div className="relative group overflow-hidden rounded-[14px] min-h-[300px] md:min-h-[350px] lg:h-[50vh] w-full">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              style={{
                backgroundImage: 'url(https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/medio-tiro-jovem-camisa-dobravel-1765251332163.jpg?width=8000&height=8000&resize=contain)',
                backgroundColor: '#F8F8F8'
              }}
              aria-label="An image for the Gifts collection category."
              role="img" />

            <div className="absolute bottom-6 left-6">
              <div className="bg-white rounded-lg px-4 py-2 shadow-md">
                <h3 style={{ color: '#2e3091' }}>Personalização</h3>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>);

};

export default CategoryShowcase;