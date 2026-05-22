from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterAPI, LoginAPI, WatchlistViewSet, PriceAlertViewSet, ProductViewSet

router = DefaultRouter()
router.register('products', ProductViewSet, basename='product')
router.register('watchlist', WatchlistViewSet, basename='watchlist')
router.register('alerts', PriceAlertViewSet, basename='pricealert')

urlpatterns = [
    path('auth/register/', RegisterAPI.as_view(), name='register'),
    path('auth/login/', LoginAPI.as_view(), name='login'),
    path('', include(router.urls)),
]
