from rest_framework import viewsets, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.authtoken.models import Token
from .models import Watchlist, PriceAlert, Product
from .serializers import (
    RegisterSerializer, UserSerializer, LoginSerializer,
    WatchlistSerializer, PriceAlertSerializer, ProductSerializer
)
from .analytics import generate_variant_insights

class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": token.key
        })

class LoginAPI(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": token.key
        })

class WatchlistViewSet(viewsets.ModelViewSet):
    serializer_class = WatchlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Watchlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PriceAlertViewSet(viewsets.ModelViewSet):
    serializer_class = PriceAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PriceAlert.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing products.
    Supports filtering by category, searching by name, and ordering.
    """
    queryset = Product.objects.prefetch_related('variants').all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['get'])
    def insights(self, request, pk=None):
        """
        Custom endpoint returning heavy analytics, charts, and Buy/Wait scores
        for all variants of a product.
        """
        product = self.get_object()
        variants = product.variants.all()
        
        results = []
        lowest_absolute_price = None
        best_variant_url = None
        
        for variant in variants:
            # Call Pandas Analytics Engine
            insight_data = generate_variant_insights(variant)
            
            # Keep track of absolute lowest price across active variants
            if "error" not in insight_data:
                curr_price = insight_data.get('statistics', {}).get('current_price')
                if curr_price is not None:
                    if lowest_absolute_price is None or curr_price < lowest_absolute_price:
                        lowest_absolute_price = curr_price
                        best_variant_url = variant.product_url
                        
            # Merge with variant details
            insight_data['attributes'] = variant.attributes
            results.append(insight_data)
            
        return Response({
            "product_id": product.id,
            "product_name": product.name,
            "best_current_price": lowest_absolute_price,
            "best_buy_link": best_variant_url,
            "variant_insights": results
        })

