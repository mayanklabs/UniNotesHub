import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "../store/authStore";
import { requestPasswordReset } from "../utils/api/authApi";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const {
    resetInput,
    setResetInput,
    resetResetInput,
    setLoading,
    setResetErrors,
    setResetSuccess,
    loading,
    resetErrors,
    resetSuccess,
  } = useAuthStore();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResetInput(name, value);
  };

  const handlePasswordResetRequest = async () => {
    setLoading(true);
    setResetErrors({});
    setResetSuccess(null);
    try {
      const response = await requestPasswordReset(resetInput.email);
      setResetSuccess(response.message);
      resetResetInput();
    } catch (err) {
      setResetErrors(err.error || { general: "Failed to send reset link" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center w-full justify-center mt-20">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your email to reset your password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              name="email"
              value={resetInput.email}
              onChange={handleInputChange}
              placeholder="Eg. john@gmail.com"
              required
            />
            {resetErrors.email && <p className="text-red-500 text-sm">{resetErrors.email}</p>}
          </div>
          {resetErrors.general && <p className="text-red-500 text-sm">{resetErrors.general}</p>}
          {resetSuccess && <p className="text-green-500 text-sm">{resetSuccess}</p>}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handlePasswordResetRequest} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
          <Link to="/login" className="text-blue-500 hover:underline text-sm">
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;