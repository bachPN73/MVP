import { Layout } from "../layout/MainLayout";
import PricingContent from "../components/PricingContent";

export default function PricingPage() {
    return (
        <Layout>
            <div className="py-8">
                <PricingContent />
            </div>
        </Layout>
    );
}
