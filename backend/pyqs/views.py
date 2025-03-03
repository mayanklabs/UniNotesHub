from rest_framework import generics, permissions
from .models import PYQ
from rest_framework.generics import ListAPIView
from .serializers import PYQSerializer
from .permissions import IsUploaderOrReadOnly
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import PYQRating
from .serializers import PYQRatingSerializer



class PYQListCreateView(generics.ListCreateAPIView):
    queryset = PYQ.objects.all()
    serializer_class = PYQSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]  # Fix: Always return a list


    def perform_create(self, serializer):
        serializer.save(uploader=self.request.user)


class UploadPYQView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PYQSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(uploader=request.user)  # Fix field name
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class UserPYQListView(generics.ListAPIView):
    serializer_class = PYQSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PYQ.objects.filter(uploader=self.request.user) 



class EditDeletePYQView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PYQSerializer
    permission_classes = [IsAuthenticated, IsUploaderOrReadOnly]

    def get_queryset(self):
        return PYQ.objects.filter(uploader=self.request.user)



class UniversityPYQListView(ListAPIView):
    serializer_class = PYQSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        university_id = self.kwargs.get("university_id")
        program_id = self.kwargs.get("program_id")
        branch_id = self.kwargs.get("branch_id")
        course_id = self.kwargs.get("course_id")

        return PYQ.objects.filter(
            course__branch__program__university_id=university_id,
            course__branch__program_id=program_id,
            course__branch_id=branch_id,
            course_id=course_id,
        )




class RatePYQView(generics.CreateAPIView):
    """
    Allow users to rate a PYQ. Users can only rate once per PYQ.
    """
    serializer_class = PYQRatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        pyq_id = self.kwargs["pyq_id"]
        user = self.request.user

        # Prevent duplicate ratings from the same user for a PYQ
        if PYQRating.objects.filter(pyq_id=pyq_id, user=user).exists():
            return Response({"error": "You have already rated this PYQ."}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save(user=user, pyq_id=pyq_id)

class PYQRatingsView(generics.ListAPIView):
    serializer_class = PYQRatingSerializer
    permission_classes = [permissions.AllowAny]  # Publicly accessible

    def get_queryset(self):
        pyq_id = self.kwargs["pyq_id"]  # Get the PYQ ID from the URL
        return PYQRating.objects.filter(pyq_id=pyq_id).order_by("-created_at")  # Latest first






class ManagePYQRatingView(generics.RetrieveUpdateDestroyAPIView):
    """
    Allow users to update or delete their own rating.
    """
    serializer_class = PYQRatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PYQRating.objects.filter(user=self.request.user)
