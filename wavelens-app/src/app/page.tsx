import Header from "@/components/Header";
import HeroSlideshow from "@/components/HeroSlideshow";
import ProblemSolution from "@/components/ProblemSolution";
import MemberServiceHighlights from "@/components/MemberServiceHighlights";
import HowItWorks from "@/components/HowItWorks";
import ProductCollection from "@/components/ProductCollection";
import Benefits from "@/components/Benefits";
import VideoMedia from "@/components/VideoMedia";
import ArchitectureSection from "@/components/ArchitectureSection";
import BrandValue from "@/components/BrandValue";
import MemberCTA from "@/components/MemberCTA";
import CompanyNumbers from "@/components/CompanyNumbers";
import CoBrand from "@/components/CoBrand";
import Athletes from "@/components/Athletes";
import CustomerReviews from "@/components/CustomerReviews";
import EmailNewsletter from "@/components/EmailNewsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSlideshow />
        <ProblemSolution />
        <MemberServiceHighlights />
        <HowItWorks />
        <ProductCollection />
        <Benefits />
        <VideoMedia />
        <ArchitectureSection />
        <BrandValue />
        <MemberCTA bgImage="/images/2nd_banner.png" title="Try WaveLens Lite — Real-time VI→EN voice translation." />
        <CompanyNumbers />
        <CoBrand />
        <Athletes />
        <CustomerReviews />
        <EmailNewsletter />
        <MemberCTA
          bgImage="/images/2nd_banner.png"
          title="Try WaveLens Lite — Start the Live Demo Now."
        />
      </main>
      <Footer />
    </>
  );
}
