import random
from datetime import timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from tracker.models import Product, Website, Variant, PriceHistory

class Command(BaseCommand):
    help = 'Seeds the database with realistic PriceRadar mock data for UI testing'

    def handle(self, *args, **kwargs):
        self.stdout.write("Clearing existing data...")
        PriceHistory.objects.all().delete()
        Variant.objects.all().delete()
        Product.objects.all().delete()
        Website.objects.all().delete()

        self.stdout.write("Creating mock websites...")
        amazon = Website.objects.create(name='Amazon', base_url='https://amazon.com')
        flipkart = Website.objects.create(name='Flipkart', base_url='https://flipkart.com')

        products_data = [
            {
                'name': 'Apple iPhone 15 Pro',
                'category': 'Electronics',
                'desc': 'Forged in titanium. A17 Pro chip.',
                'img': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=400',
                'trend': 'volatile',
                'base_price': 1099.00,
                'variants': [
                    {'attrs': {'storage': '128GB', 'color': 'Natural Titanium', 'store': 'Amazon'}, 'url_suffix': 'iphone-15-pro-amz'},
                    {'attrs': {'storage': '128GB', 'color': 'Midnight Black', 'store': 'Flipkart'}, 'url_suffix': 'iphone-15-pro-flp'},
                ]
            },
            {
                'name': 'Sony WH-1000XM5',
                'category': 'Electronics',
                'desc': 'Industry leading noise canceling wireless headphones.',
                'img': 'https://m.media-amazon.com/images/I/41JACWT-wWL._AC_SX425_.jpg',
                'trend': 'downward',
                'base_price': 398.00,
                'variants': [
                    {'attrs': {'color': 'Silver', 'store': 'Amazon'}, 'url_suffix': 'sony-xm5-amz'},
                    {'attrs': {'color': 'Black', 'store': 'Flipkart'}, 'url_suffix': 'sony-xm5-flp'},
                ]
            },
            {
                'name': 'Samsung 49" Odyssey OLED G9',
                'category': 'Electronics',
                'desc': 'Dual QHD Curved Smart Gaming Monitor.',
                'img': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400',
                'trend': 'flash_sales',
                'base_price': 1299.99,
                'variants': [
                    {'attrs': {'size': '49 inch', 'store': 'Amazon'}, 'url_suffix': 'samsung-g9-amz'},
                    {'attrs': {'size': '49 inch', 'store': 'Flipkart'}, 'url_suffix': 'samsung-g9-flp'},
                ]
            },
            {
                'name': 'The Pragmatic Programmer: 20th Anniversary Edition',
                'category': 'Books',
                'desc': 'Your journey to mastery, 20th Anniversary Edition.',
                'img': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400',
                'variants': [
                    {'attrs': {'edition': 'Hardcover', 'store': 'Amazon'}, 'url_suffix': 'pragmatic-programmer-hc', 'base_price': 2500, 'trend': 'stable'},
                    {'attrs': {'edition': 'Kindle Edition', 'store': 'Amazon'}, 'url_suffix': 'pragmatic-programmer-kdl', 'base_price': 1800, 'trend': 'downward'},
                ]
            },
            {
                'name': 'Sony PlayStation 5 Console',
                'category': 'Gaming',
                'desc': 'Next-gen gaming console with ultra-high speed SSD.',
                'img': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400',
                'variants': [
                    {'attrs': {'edition': 'Disc Edition', 'store': 'Amazon'}, 'url_suffix': 'ps5-disc-amz', 'base_price': 54990, 'trend': 'flash_sales'},
                ]
            },
            {
                'name': 'Apple MacBook Air M3 (2024)',
                'category': 'Computers',
                'desc': 'Supercharged by M3. Lean. Mean. M3 machine.',
                'img': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400',
                'variants': [
                    {'attrs': {'specs': '16GB RAM, 512GB SSD', 'store': 'Amazon'}, 'url_suffix': 'macbook-air-m3-amz', 'base_price': 134900, 'trend': 'downward'},
                ]
            }
        ]

        today = timezone.now()
        
        self.stdout.write("Generating products, variants, and mathematical 90-day price histories...")
        for p_data in products_data:
            product = Product.objects.create(
                name=p_data['name'],
                category=p_data['category'],
                description=p_data['desc'],
                image_url=p_data['img']
            )

            for v_data in p_data['variants']:
                trend_type = v_data.get('trend', p_data.get('trend', 'stable'))
                base_price = v_data.get('base_price', p_data.get('base_price', 1000.0))

                store_name = v_data['attrs']['store']
                domain = 'amazon.com' if store_name == 'Amazon' else 'flipkart.com'
                product_url = f"https://{domain}/{v_data['url_suffix']}"
                
                variant = Variant.objects.create(
                    product=product,
                    attributes=v_data['attrs'],
                    product_url=product_url
                )

                current_price = base_price

                histories = []
                for i in range(90, -1, -1):
                    day = today - timedelta(days=i)
                    
                    if i == 90:
                        current_price = base_price
                    else:
                        if trend_type == 'volatile':
                            change_pct = random.uniform(-0.06, 0.06)
                            current_price = current_price * (1 + change_pct)
                            if current_price > base_price * 1.2:
                                current_price *= 0.95
                            elif current_price < base_price * 0.8:
                                current_price *= 1.05
                        
                        elif trend_type == 'downward':
                            decay = random.uniform(0.001, 0.005)
                            current_price = current_price * (1 - decay)
                            if random.random() < 0.1:
                                current_price *= 1.02
                                
                        elif trend_type == 'flash_sales':
                            days_elapsed = 90 - i
                            if days_elapsed % 14 == 0 and days_elapsed > 0:
                                current_price = base_price * 0.85
                            elif days_elapsed % 14 == 1:
                                current_price = base_price
                            else:
                                current_price = current_price * random.uniform(0.995, 1.005)

                        elif trend_type == 'stable':
                            current_price = current_price * random.uniform(0.998, 1.002)

                    current_price = max(current_price, base_price * 0.4)
                    current_price = round(current_price, 2)
                    
                    histories.append(PriceHistory(
                        variant=variant,
                        price=Decimal(str(current_price)),
                        timestamp=day
                    ))
                
                PriceHistory.objects.bulk_create(histories)
                
                variant.current_price = Decimal(str(current_price))
                variant.save()

        self.stdout.write(self.style.SUCCESS("Database seeded successfully with mathematical variances!"))
