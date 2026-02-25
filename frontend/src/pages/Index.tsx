import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProposalsSection from "@/components/ProposalsSection";
import Footer from "@/components/Footer";
import WalletConnectModal from "@/components/WalletConnectModal";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <WalletConnectModal />
      <main>
        <HeroSection />
        <ProposalsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
