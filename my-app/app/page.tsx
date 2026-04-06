import AboutPage from "@/components/landing/About";
import Hero from "@/components/landing/Hero";
import Services from "@/components/landing/Services";
import Plans from "@/components/landing/Plans";
import Contact from "@/components/landing/Contact";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Marquee from "@/components/landing/Marquee";


const Page = () => {
  return (

    <>
    <Navbar/>


      <main>

        {/* 🔥 FULL WIDTH HERO */}
        <section
          id="home"
          className="w-full min-h-screen"
        >
          <Hero />
        </section>

        <Marquee />

        {/* BOXED CONTENT BELOW */}
        <section id="about" className="pt-20">
          <AboutPage />
        </section>

        <section id="services" className="pt-20">
          <Services />
        </section>

        <section id="plans" className="pt-20">
          <Plans />
        </section>

        <section id="contact" className="pt-20">
          <Contact />
        </section>

      </main>

      <Footer/>
    </>
    
  );
};

export default Page;
