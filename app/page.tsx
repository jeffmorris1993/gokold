import Nav from "./components/nav";
import HeroScrub from "./components/hero-scrub";
import HorizontalStory from "./components/horizontal-story";
import Features from "./components/features";
import Statement from "./components/statement";
import Details from "./components/details";
import Stats from "./components/stats";
import Manifesto from "./components/manifesto";
import EarlyAccess from "./components/early-access";
import Faq from "./components/faq";
import Footer from "./components/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <HeroScrub />
        <HorizontalStory />
        <Features />
        <Statement />
        <Details />
        <Stats />
        <Manifesto />
        <EarlyAccess />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
