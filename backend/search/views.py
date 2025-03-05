from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from pyqs.models import PYQ
from pyqs.serializers import PYQSerializer

class SearchPYQView(generics.ListAPIView):
    queryset = PYQ.objects.all()
    serializer_class = PYQSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['year', 'semester', 'university', 'program', 'branch', 'course']
    search_fields = ['course__name', 'branch__name', 'program__name', 'university__name']
