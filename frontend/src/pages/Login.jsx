import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "../store/authStore";
import { registerUser, loginUser, logoutUser } from "../utils/api/authApi";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const {
    signupInput,
    loginInput,
    setSignupInput,
    setLoginInput,
    setAuth,
    resetSignupInput,
    resetLoginInput,
    setLoading,
    setLoginErrors,
    setSignupErrors,
    clearErrors,
    loading,
    loginErrors,
    signupErrors,
    token,
    refreshToken,
    logout,
  } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Login component mounted, token:", token);
  }, [token]);

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") setSignupInput(name, value);
    else setLoginInput(name, value);
  };

  const handleRegistration = async (type) => {
    setLoading(true);
    clearErrors();
    try {
      const inputData = type === "signup" ? signupInput : loginInput;
      const action = type === "signup" ? registerUser : loginUser;
      const response = await action(inputData);

      if (type === "signup") {
        resetSignupInput();
        setSignupErrors({ success: "Please check your email to verify your account." });
      } else {
        setAuth(response.user, response.token, response.refreshToken);
        resetLoginInput();
        navigate("/");
      }
    } catch (err) {
      const errors = err.error || err;
      if (type === "login") setLoginErrors(errors);
      else setSignupErrors(errors);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser(refreshToken);
      logout();
      navigate("/login");
    } catch (err) {
      setLoginErrors(err.error || { general: "Logout failed" });
    }
  };

  const handleTabChange = () => {
    clearErrors();
  };

  return (
    <div className="flex items-center w-full justify-center mt-20">
      <Tabs defaultValue="login" className="w-[400px]" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">Signup</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>Create a new account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={signupInput.name}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Eg. John"
                  required
                />
                {signupErrors.name && <p className="text-red-500 text-sm">{signupErrors.name}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  type="email"
                  name="email"
                  value={signupInput.email}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Eg. john@gmail.com"
                  required
                />
                {signupErrors.email && <p className="text-red-500 text-sm">{signupErrors.email}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={signupInput.password}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Password"
                  required
                />
                {signupErrors.password && <p className="text-red-500 text-sm">{signupErrors.password}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmpassword">Confirm Password</Label>
                <Input
                  type="password"
                  name="confirmpassword"
                  value={signupInput.confirmpassword}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Confirm Password"
                  required
                />
                {signupErrors.confirm_password && <p className="text-red-500 text-sm">{signupErrors.confirm_password}</p>}
              </div>
              {signupErrors.success && <p className="text-green-500 text-sm">{signupErrors.success}</p>}
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleRegistration("signup")} disabled={loading}>
                {loading ? "Signing up..." : "Signup"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Login with your credentials.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={loginInput.email}
                  onChange={(e) => changeInputHandler(e, "login")}
                  placeholder="Eg. john@gmail.com"
                  required
                />
                {loginErrors.email && <p className="text-red-500 text-sm">{loginErrors.email}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={loginInput.password}
                  onChange={(e) => changeInputHandler(e, "login")}
                  placeholder="Password"
                  required
                />
                {loginErrors.password && <p className="text-red-500 text-sm">{loginErrors.password}</p>}
              </div>
              {loginErrors.general && <p className="text-red-500 text-sm">{loginErrors.general}</p>}
              <p className="text-sm text-center mt-2">
                <Link to="/forgot-password" className="text-blue-500 hover:underline">
                  Forgot Password?
                </Link>
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={() => handleRegistration("login")} disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
              {token && (
                <Button onClick={handleLogout} disabled={loading}>
                  Logout
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Login;