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

  const handleResetConfirm = async () => {
    setLoading(true);
    setResetErrors({});
    setResetSuccess(null);
    try {
      const response = await confirmPasswordReset(
        uidb64,
        token,
        resetConfirmInput.newPassword,
        resetConfirmInput.confirmPassword
      );
      setResetSuccess(response.message);
      resetResetConfirmInput();
      // Navigate to login within the same window after 2 seconds
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setResetErrors(err.error || { general: "Failed to reset password" });
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
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              type="password"
              name="newPassword"
              value={resetConfirmInput.newPassword}
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
              value={resetConfirmInput.confirmPassword}
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
          <Button onClick={handleResetConfirm} disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PasswordResetConfirm;