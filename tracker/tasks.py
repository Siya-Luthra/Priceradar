from celery import shared_task
from django.utils import timezone
import logging
from .models import Variant, PriceHistory
from .scraper import fetch_product_data

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def run_daily_price_sync(self):
    """
    Periodic task to sync prices for all active tracked variants.
    """
    variants = Variant.objects.filter(is_tracked=True)
    success_count = 0

    for variant in variants:
        try:
            logger.info(f"Scraping {variant.product_url}")
            data = fetch_product_data(variant.product_url)
            
            if data['price'] is not None:
                # Write to PriceHistory
                PriceHistory.objects.create(
                    variant=variant,
                    price=data['price'],
                    timestamp=timezone.now()
                )
                
                # Update current_price cache
                variant.current_price = data['price']
                variant.save(update_fields=['current_price'])
                success_count += 1
                
        except Exception as exc:
            logger.error(f"Failed to scrape {variant.product_url}: {exc}")
            # Exponential backoff retry logic if network error
            if "Connection error" in str(exc):
                # 2 ** retries means: 1st retry in 2s, 2nd in 4s, 3rd in 8s.
                countdown = 2 ** self.request.retries
                raise self.retry(exc=exc, countdown=countdown)

    logger.info(f"Completed sync. Updated {success_count}/{variants.count()} variants.")
    return success_count
