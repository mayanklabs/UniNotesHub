from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from .serializers import UserRegistrationSerializer, UserProfileSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from .models import Profile
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False
            user.save()

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            verification_link = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}"

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


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = get_object_or_404(User, pk=uid)

            if default_token_generator.check_token(user, token):
                user.is_active = True
                user.save()
                return Response({"message": "Email verified successfully!"}, status=status.HTTP_200_OK)
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError, OverflowError):
            return Response({"error": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        if not User.objects.filter(email=email).exists():
            return Response({"error": {"email": "No user found with this email address."}}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(email=email, password=password)
        if user:
            if not user.is_active:
                return Response({"error": {"email": "Please verify your email to activate your account."}}, 
                                status=status.HTTP_401_UNAUTHORIZED)
            
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            response = Response({
                "user": UserProfileSerializer(user).data,
                "message": "Login successful",
                "access_token": access_token,
                "refresh_token": str(refresh),
                "csrf_token": get_token(request)
            }, status=status.HTTP_200_OK)

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
            response.set_cookie(
                key="csrftoken",
                value=get_token(request),
                httponly=False,
                secure=True,
                samesite="Lax",
                max_age=30 * 60
            )
            return response

        return Response({"error": {"password": "Incorrect password."}}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(["GET"])
def get_csrf_token(request):
    csrf_token = get_token(request)
    response = JsonResponse({"csrfToken": csrf_token})
    response.set_cookie("csrftoken", csrf_token, httponly=False, secure=True, samesite="Lax", max_age=1800)
    return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"error": "No refresh token provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError as e:
            return Response({"error": f"Invalid token: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        response.delete_cookie("csrftoken")
        return response


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        name = request.data.get("name", user.name)
        profile_picture = request.FILES.get("profile_picture")

        user.name = name
        user.save()

        if not hasattr(user, 'auth_profile'):
            Profile.objects.create(user=user)
        
        if profile_picture:
            user.auth_profile.picture = profile_picture
            user.auth_profile.save()

        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_link = f"{settings.FRONTEND_URL}/password/reset/confirm/{uid}/{token}"

            try:
                send_mail(
                    "Reset Your Password",
                    f"Click the link to reset your password: {reset_link}",
                    settings.EMAIL_HOST_USER,
                    [user.email],
                    fail_silently=False,
                )
                return Response({"message": "Password reset link sent to your email."}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": "Failed to send email", "details": str(e)},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):  # Ensure this class is present
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = get_object_or_404(User, pk=uid)

            if default_token_generator.check_token(user, token):
                serializer = PasswordResetConfirmSerializer(data=request.data)
                if serializer.is_valid():
                    user.set_password(serializer.validated_data['new_password'])
                    user.save()
                    return Response({"message": "Password reset successfully!"}, status=status.HTTP_200_OK)
                return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"error": {"token": "Invalid or expired token"}}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError, OverflowError):
            return Response({"error": {"request": "Invalid request"}}, status=status.HTTP_400_BAD_REQUEST)
