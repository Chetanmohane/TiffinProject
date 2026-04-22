import AboutPage from "@/components/landing/About";
import Hero from "@/components/landing/Hero";
import Services from "@/components/landing/Services";
import Plans from "@/components/landing/Plans";
import Contact from "@/components/landing/Contact";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Marquee from "@/components/landing/Marquee";
import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

async function getSettings() {
  await connectDB();
  const settings = await SiteSettings.findOne().lean();
  // Stringify the objects to avoid serialization issues with MongoDB _id
  return JSON.parse(JSON.stringify(settings || {}));
}

export default async function Page() {
  const settings = await getSettings();

  return (
    <>
      <Navbar />
      <main>
        <section id="home" className="w-full min-h-screen">
          <Hero initialData={settings.hero} />
        </section>

        <Marquee />

        <section id="about" className="pt-20">
          <AboutPage initialData={settings} />
        </section>

        <section id="services" className="pt-20">
          <Services initialData={settings.services} />
        </section>

        <section id="plans" className="pt-20">
          <Plans />
        </section>

        <section id="contact" className="pt-20">
          <Contact initialData={settings.contact} />
        </section>
      </main>
      <Footer initialData={settings.contact} />
    </>
  );
}
