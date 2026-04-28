from fastapi import APIRouter, Depends
import requests
from auth import verify_token

router=APIRouter()

NEWS_API_KEY="84a73c2ef30b4ddf9aea9eefbbf6e066"
@router.get("/")
def get_news(current_user:str=Depends(verify_token)):
    response=requests.get("https://api.aiornot.com/v1/reports/image",
                        params={
                        "q":"environment pollution climate change deforestation",
                        "language":"en",
                        "sortBy": "publishedAt",
                        "pageSize": 10,
                        "apiKey": NEWS_API_KEY
                    })
    
    data = response.json()
    articles = data.get("articles", [])

    news = []
    for article in articles:
        news.append({
            "title": article["title"],
            "description": article["description"],
            "url": article["url"],
            "source": article["source"]["name"],
            "published_at": article["publishedAt"]
        })

    return {"news": news}