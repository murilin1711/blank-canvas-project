"use client";

const AccessibilityWidget = () => {
  const altText = "Conteúdo acessível em Libras usando o VLibras Widget com opções dos Avatares Ícaro, Hosana ou Guga.";

  return (
    <div id="vlibras" className="enabled fixed bottom-5 left-5 z-40">
      <div
        id="vlibrasclick"
        className="active group relative flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-full bg-white/50 backdrop-blur-md transition-transform duration-300 ease-in-out hover:scale-105 md:h-[60px] md:w-[60px]"
        role="button"
        tabIndex={0}
        aria-label={altText}>

        <img
          className="vp-access-button w-8 h-8"
          src=""
          alt=""
        />

        <img
          className="vp-pop-up pointer-events-none absolute bottom-0 left-full mb-2 ml-4 rounded-lg shadow-md opacity-0 invisible transition-opacity duration-300 group-hover:opacity-100 group-hover:visible w-60 h-auto"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/b560228b-ad03-4100-8449-603f81169220-osklen-com-br/assets/images/access_popup-1.jpg"
          alt={altText}
        />

      </div>
    </div>);

};

export default AccessibilityWidget;
