import AuthLayout from "@/components/common/AuthLayout";
import { Button } from "@/components/ui/button";
import VerifyEmailForm from "@/features/auth/components/VerifyEmailForm";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

const VerifyEmail = ({ email }: { email: string }) => (
  <AuthLayout>
    <div className="w-full max-w-md">
      <Button variant="ghost" className="mb-4 text-blue-100 hover:bg-white/10 hover:text-white" asChild>
        <Link to="/sign-up"><ArrowLeft className="size-4" />Back to sign up</Link>
      </Button>
      <VerifyEmailForm email={email} />
    </div>
  </AuthLayout>
);

export default VerifyEmail;
