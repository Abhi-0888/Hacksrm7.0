import { ProposalsList } from "@/components/sections/ProposalsList";
import { Footer } from "@/components/layout/Footer";

export default function ProposalsPage() {
    return (
        <div className="flex flex-col">
            <ProposalsList />
            <Footer />
        </div>
    );
}
