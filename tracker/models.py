import uuid
from django.db import models
from django.contrib.auth.models import User

class Product(models.Model):
    """
    Represents a product that can be tracked across multiple websites.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['name'], name='product_name_idx'),
            models.Index(fields=['category'], name='product_category_idx'),
        ]

    def __str__(self):
        return f"{self.name} ({self.category})"


class Website(models.Model):
    """
    Represents an e-commerce website where products are tracked.
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    base_url = models.URLField()
    logo_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Variant(models.Model):
    """
    Represents a specific variant of a product (e.g., color, storage size) on a specific website.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    attributes = models.JSONField(default=dict, blank=True)
    product_url = models.URLField(unique=True)
    current_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_tracked = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.product.name} Variant - {self.id}"


class PriceHistory(models.Model):
    """
    Records the price history of a specific product variant over time.
    """
    id = models.BigAutoField(primary_key=True)
    variant = models.ForeignKey(Variant, on_delete=models.CASCADE, related_name='price_history')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['variant', 'timestamp'], name='variant_timestamp_idx'),
        ]

    def __str__(self):
        return f"{self.variant.id} at {self.timestamp}: {self.price}"


class Watchlist(models.Model):
    """
    Tracks which variants a user is watching.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlist')
    variant = models.ForeignKey(Variant, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'variant'], name='unique_user_variant_watchlist')
        ]

    def __str__(self):
        return f"{self.user.username} watching {self.variant.id}"


class PriceAlert(models.Model):
    """
    Stores user-defined price alerts for specific variants.
    """
    CHANNEL_CHOICES = [
        ('email', 'Email'),
        ('webhook', 'Webhook'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alerts')
    variant = models.ForeignKey(Variant, on_delete=models.CASCADE)
    target_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Alert for {self.user.username} on {self.variant.id} at {self.target_price}"


class SearchHistory(models.Model):
    """
    Logs user search queries for tracking search behavior.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    query_string = models.CharField(max_length=255)
    searched_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} searched '{self.query_string}'"
