from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from .serializers import UserRegistrationSerializer, UserProfileSerializer
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated


User = get_user_model()


# 🔹 Register User
class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False  # Disable login until email verification
            user.save()

            # Generate email verification token
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            verification_link = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}"

            # Send verification email
            try:
                send_mail(
                    "Verify Your Email",
                    f"Click the link to verify your email: {verification_link}",
                    settings.EMAIL_HOST_USER,
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                return Response({"error": "Failed to send email", "details": str(e)},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({"message": "Registration successful. Check your email to verify your account."},
                            status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 🔹 Email Verification**
class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = get_object_or_404(User, pk=uid)

            if default_token_generator.check_token(user, token):
                user.is_active = True
                user.save()
                return Response({"message": "Email verified successfully!"}, status=status.HTTP_200_OK)

            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        except (ValueError, TypeError, OverflowError):
            return Response({"error": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)


# 🔹 Login User
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(email=email, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            response = Response({
                "user": UserProfileSerializer(user).data,
                "message": "Login successful",
                "csrf_token": get_token(request)  # Include CSRF token in response
            }, status=200)


# Set secure cookies for authentication
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite="Lax",
                max_age=30 * 60
            )
            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=True,
                secure=True,
                samesite="Lax",
                max_age=7 * 24 * 60 * 60
            )

            # Set CSRF Token Cookie
            response.set_cookie(
                key="csrftoken",
                value=get_token(request),
                httponly=False,  # CSRF token should be accessible by JavaScript
                secure=True,
                samesite="Lax",
                max_age=30 * 60
            )

            return response

        return Response({"error": "Invalid email or password"}, status=401)


# 🔹 CSRF Token Endpoint
@api_view(["GET"])
def get_csrf_token(request):
    """Returns a CSRF token in both JSON response and cookie."""
    csrf_token = get_token(request)

    response = JsonResponse({"csrfToken": csrf_token})
    response.set_cookie(
        key="csrftoken",
        value=csrf_token,
        httponly=False,
        secure=True,
        samesite="Lax",
        max_age=30 * 60
    )
    return response


# Logout

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        
        if not refresh_token:
            return Response({
                "error": "No refresh token provided",
                "cookies_received": request.COOKIES
            }, status=400)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError as e:
            return Response({"error": f"Invalid token: {str(e)}"}, status=400)
        except Exception as e:
            return Response({"error": f"Logout failed: {str(e)}"}, status=500)

        response = Response({"message": "Logged out successfully"}, status=200)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        response.delete_cookie("csrftoken")
        return response