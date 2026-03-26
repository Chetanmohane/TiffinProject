import Image from "next/image";

export default function AboutPage() {
  return (
    <section className="w-full bg-white overflow-hidden">
      {/* HERO */}
      <div className="mt-10 py-12 sm:py-16 px-4 sm:px-6 lg:px-20 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">
          About <span className="text-orange-600">Annapurna Delight</span>
        </h1>

        <p className="mt-4 text-gray-600 max-w-3xl mx-auto text-base sm:text-lg">
          Serving healthy, hygienic and home-style meals — just like
          <span className="font-medium"> ghar ka khana ❤️</span>
        </p>
      </div>

      {/* STORY SECTION */}
      <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-12 px-4 sm:px-6 lg:px-20 py-12 sm:py-10">
        {/* IMAGE */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <Image
            src="/img1.webp"
            alt="Home style cooking"
            width={600}
            height={400}
            className="w-full max-w-md sm:max-w-lg rounded-xl shadow-lg shadow-gray-400 hover:scale-105 transition duration-300"
            priority
          />
        </div>

        {/* TEXT */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Our Story
          </h2>

          <p className="text-gray-500 text-base sm:text-lg lg:text-xl leading-relaxed mb-4">
            Annapurna Delight Tiffin Centre was started with one simple goal —
            to provide healthy, homemade meals to students, working
            professionals, and families who miss the comfort of home food.
          </p>

          <p className="text-gray-500 text-base sm:text-lg lg:text-xl leading-relaxed">
            Every meal is freshly prepared using quality ingredients,
            traditional recipes, and strict hygiene standards. We believe food
            should nourish both the body and soul.
          </p>
        </div>
      </div>

      {/* FOOD SECTION */}
      <div className="flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-12 px-4 sm:px-6 lg:px-20 py-12 sm:py-16">
        {/* TEXT */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Cooked With Love ❤️
          </h2>

          <p className="text-gray-500 text-base sm:text-lg lg:text-xl leading-relaxed">
            Our experienced cooks prepare every meal with care, consistency,
            and love. We treat our customers like family and take pride in
            serving food that brings comfort and satisfaction.
          </p>
        </div>

        {/* IMAGE */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <Image
            src="/img2.webp"
            alt="Delicious Tiffin Meal"
            width={600}
            height={400}
            className="w-full max-w-md sm:max-w-lg rounded-xl shadow-lg shadow-gray-400 hover:scale-105 transition duration-300"
          />
        </div>
      </div>
    </section>
  );
}
