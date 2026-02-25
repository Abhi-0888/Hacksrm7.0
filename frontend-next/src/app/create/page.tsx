import { CreateProposalForm } from "@/components/sections/CreateProposalForm";
import { Footer } from "@/components/layout/Footer";

export default function CreateProposalPage() {
    return (
        <div className="flex flex-col">
            <CreateProposalForm />
            <Footer />
        </div>
    );
}
