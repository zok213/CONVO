import Header from "@/components/Header";
import HeroSlideshow from "@/components/HeroSlideshow";
import MemberServiceHighlights from "@/components/MemberServiceHighlights";
import ProductCollection from "@/components/ProductCollection";

import VideoMedia from "@/components/VideoMedia";
import BrandValue from "@/components/BrandValue";
import MemberCTA from "@/components/MemberCTA";
import CompanyNumbers from "@/components/CompanyNumbers";
import CoBrand from "@/components/CoBrand";
import CustomerReviews from "@/components/CustomerReviews";
import EmailNewsletter from "@/components/EmailNewsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSlideshow />
        <MemberServiceHighlights />
        <ProductCollection />
        <VideoMedia />
        <BrandValue />
        <MemberCTA bgImage="/images/2nd_banner.png" title="Try WaveLens Lite — Real-time VI→EN voice translation." />
        <CompanyNumbers />
        <CoBrand />
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
