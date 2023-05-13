import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <main className="flex flex-col items-center min-h-full mx-6 mt-8 mb-12 h-fit">
      {children}
    </main>
    <Footer />
  </>
);

export default AdminLayout;
