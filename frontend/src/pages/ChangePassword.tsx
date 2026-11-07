import AuthLayout from "@/components/common/AuthLayout";
import ChangePasswordForm from "@/features/auth/components/ChangePasswordForm";

type ChangePasswordProps = { token: string; email: string };

const ChangePassword = ({ token, email }: ChangePasswordProps) => (
  <AuthLayout><ChangePasswordForm email={email} token={token} /></AuthLayout>
);

export default ChangePassword;
