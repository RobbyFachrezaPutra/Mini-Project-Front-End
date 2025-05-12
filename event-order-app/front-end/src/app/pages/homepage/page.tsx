import HomeView from "@/components/homepage";
import Navbar from "@/components/navbar";
import { Suspense } from "react";

export default function HomePage() {
  return (<>
    <Suspense>
        <Navbar />
        <HomeView />        
    </Suspense>
      </>        
  );
}
