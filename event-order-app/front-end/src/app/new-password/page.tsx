import NewPasswordPage from "@/components/new-password";
import { Suspense } from "react";

export default function NewPassword() {
  return (<Suspense>
          <NewPasswordPage />;
        </Suspense>
  )
}
