import pandas as pd
from tracker.models import PriceHistory

def generate_variant_insights(variant):
    """
    Generates deterministic statistical insights and a Buy/Wait confidence score
    for a given product variant using Pandas. Includes time-series array for UI charts.
    """
    # Fetch price history from database
    history = PriceHistory.objects.filter(variant=variant).order_by('timestamp')
    if not history.exists():
        return {"error": "No price history available for this variant."}

    # Load into Pandas DataFrame
    data = list(history.values('price', 'timestamp'))
    df = pd.DataFrame(data)
    
    # Ensure price is float
    df['price'] = df['price'].astype(float)
    df.set_index('timestamp', inplace=True)
    df.sort_index(inplace=True)

    current_price = float(variant.current_price) if variant.current_price else df.iloc[-1]['price']
    lifetime_lowest = float(df['price'].min())
    lifetime_highest = float(df['price'].max())
    avg_price = float(df['price'].mean())
    median_price = float(df['price'].median())
    
    # Calculate price volatility (standard deviation relative to the mean)
    std_dev = df['price'].std() if len(df) > 1 else 0.0
    volatility = float(std_dev / avg_price) if avg_price > 0 else 0.0

    # 2. Moving Averages
    df_daily = df.resample('D').last().ffill()
    if df_daily.empty or df_daily['price'].isna().all():
        df_daily = df.copy()

    sma_30 = df_daily['price'].rolling(window=30, min_periods=1).mean()
    df_daily['sma_30'] = sma_30

    latest_sma_30 = float(sma_30.iloc[-1]) if not sma_30.empty else current_price

    # 3. Buy/Wait Confidence Engine (Score 0-100)
    score = 50 # Start neutral

    # Add points if current price is within 10% of the all-time low
    if current_price <= lifetime_lowest * 1.10:
        score += 30
        
    # Add points if the price is below the 30-day SMA
    if current_price < latest_sma_30:
        score += 20
        
    # Add points if the last 3 days show a downward trend
    if len(df_daily) >= 3:
        last_3 = df_daily['price'].iloc[-3:].tolist()
        if last_3[0] > last_3[1] and last_3[1] > last_3[2]:
            score += 15

    # Clamp the final score between 0 and 100
    score = max(0, min(100, int(score)))

    # Determine string recommendation
    if score >= 70:
        recommendation = "BUY NOW"
    elif score <= 40:
        recommendation = "WAIT"
    else:
        recommendation = "HOLD"

    # 4. Smart Narrative Strings (kept for UI compatibility)
    insights = []
    if recommendation == "BUY NOW":
        insights.append("Our confidence engine strongly recommends buying now.")
    elif recommendation == "WAIT":
        insights.append("Our confidence engine recommends waiting for a price drop.")
    else:
        insights.append("Market is relatively stable. Hold your position.")

    # 5. Chart Data (raw dataframe converted to dict for Recharts)
    chart_data = []
    for timestamp, row in df_daily.iterrows():
        chart_data.append({
            "timestamp": timestamp.strftime('%Y-%m-%d') if pd.notna(timestamp) else None,
            "price": float(row['price']) if pd.notna(row['price']) else None,
            "sma_30": float(row['sma_30']) if pd.notna(row['sma_30']) else None
        })

    return {
        "variant_id": str(variant.id),
        "product_url": variant.product_url,
        "recommendation": recommendation,
        "statistics": {
            "current_price": current_price,
            "lifetime_lowest": lifetime_lowest,
            "lifetime_highest": lifetime_highest,
            "average_price": avg_price,
            "median_price": median_price,
            "volatility": volatility,
        },
        "confidence_score": score,
        "insights": insights,
        "chart_data": chart_data
    }
