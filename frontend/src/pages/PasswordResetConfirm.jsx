import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "../store/authStore";
import { confirmPasswordReset } from "../utils/api/authApi";
import { useNavigate, useParams } from "react-router-dom";

const PasswordResetConfirm = () => {
  const { uidb64, token } = useParams();
  const {
    resetConfirmInput,
    setResetConfirmInput,
    resetResetConfirmInput,
    setLoading,
    setResetErrors,
    setResetSuccess,
    loading,
    resetErrors,
    resetSuccess,
  } = useAuthStore();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResetConfirmInput(name, value);
  };

  const handleResetConfirm = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const { newPassword, confirmPassword } = resetConfirmInput;

    // Client-side validation
    if (!newPassword || !confirmPassword) {
      setResetErrors({ general: "Both fields are required" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetErrors({ general: "Passwords do not match" });
      return;
    }

    setLoading(true);
    setResetErrors({});
    setResetSuccess(null);

    try {
      const response = await confirmPasswordReset(uidb64, token, newPassword, confirmPassword);
      setResetSuccess(response.message || "Password reset successfully! Redirecting to login...");
      resetResetConfirmInput();
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setResetErrors(err.error || { general: "Failed to reset password. The link may be invalid or expired." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center w-full justify-center mt-20">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your new password.</CardDescription>
        </CardHeader>
        <form onSubmit={handleResetConfirm}>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                type="password"
                name="newPassword"
                value={resetConfirmInput.newPassword || ""} // Ensure controlled input
                onChange={handleInputChange}
                placeholder="New Password"
                required
              />
              {resetErrors.new_password && <p className="text-red-500 text-sm">{resetErrors.new_password}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                type="password"
                name="confirmPassword"
                value={resetConfirmInput.confirmPassword || ""} // Ensure controlled input
                onChange={handleInputChange}
                placeholder="Confirm Password"
                required
              />
              {resetErrors.confirm_password && <p className="text-red-500 text-sm">{resetErrors.confirm_password}</p>}
            </div>
            {resetErrors.general && <p className="text-red-500 text-sm">{resetErrors.general}</p>}
            {resetErrors.token && <p className="text-red-500 text-sm">{resetErrors.token}</p>}
            {resetSuccess && <p className="text-green-500 text-sm">{resetSuccess}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PasswordResetConfirm;