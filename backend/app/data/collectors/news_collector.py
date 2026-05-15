"""
News Collector — Sammelt Breaking News aus verschiedenen Quellen
Twitter, Reddit, Official Team Sources, RSS Feeds
"""
import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Dict
import aiohttp
import feedparser
from loguru import logger

from app.models.alerts import NewsAlert, NewsSource, AlertType, AlertPriority
from app.core.nlp_classifier import (
    classify_news,
    extract_entities,
    calculate_impact_score,
)


class NewsCollector:
    """Sammelt News aus verschiedenen Quellen"""

    def __init__(self, db_session=None):
        self.db = db_session
        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def collect_all_sources(self) -> List[Dict]:
        """
        Sammle aus ALLEN Quellen parallel
        Returns: Liste von News-Dicts mit Metadaten
        """
        if not self.session:
            self.session = aiohttp.ClientSession()

        tasks = [
            self._collect_twitter_keywords(),
            self._collect_reddit(),
            self._collect_official_sources(),
            self._collect_rss_feeds(),
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        all_news = []
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Collection error: {result}")
                continue
            if result:
                all_news.extend(result)

        logger.info(f"Collected {len(all_news)} news items from all sources")
        return all_news

    async def _collect_twitter_keywords(self) -> List[Dict]:
        """
        Sammle Tweets mit Fußball-Keywords
        HINWEIS: Benötigt Twitter API Keys in .env

        Keywords: "verletzung", "Bayern", "Dortmund", "Quoten", etc.
        """
        news = []

        # TODO: Twitter API V2 Integration
        # Für MVP: Mock-Daten
        logger.info("Twitter collection: (requires API keys)")

        return news

    async def _collect_reddit(self) -> List[Dict]:
        """
        Sammle Threads von r/soccer, r/bundesliga
        HINWEIS: Benötigt Reddit API Keys
        """
        news = []

        # TODO: PRAW Integration
        logger.info("Reddit collection: (requires API keys)")

        return news

    async def _collect_official_sources(self) -> List[Dict]:
        """
        Sammle von offiziellen Team-Accounts
        - Bayern Twitter
        - BVB Twitter
        - DFL Offiziell
        """
        news = []

        official_accounts = {
            "bayern": "https://twitter.com/FCBayernEN/search?q=injury",
            "bvb": "https://twitter.com/BVB/search?q=injury",
        }

        # TODO: Web-Scraping der Twitter-Accounts
        logger.info("Official sources collection: (requires scraping)")

        return news

    async def _collect_rss_feeds(self) -> List[Dict]:
        """
        Sammle RSS Feeds von News-Seiten
        - Sportschau
        - Kicker
        - Sky Sports
        - ESPN
        """
        rss_feeds = [
            {
                "url": "https://www.kicker.de/news/fussball/bundesliga/aktuell/rss.xml",
                "source": NewsSource.RSS,
                "name": "Kicker.de",
            },
            {
                "url": "https://www.sportschau.de/feed/bundesliga-news.xml",
                "source": NewsSource.RSS,
                "name": "Sportschau",
            },
        ]

        news = []

        for feed_config in rss_feeds:
            try:
                parsed = feedparser.parse(feed_config["url"])

                for entry in parsed.entries[:20]:  # Letzte 20 Artikel
                    try:
                        item = {
                            "title": entry.get("title", ""),
                            "description": entry.get("summary", ""),
                            "source_url": entry.get("link", ""),
                            "published_at": datetime(*entry.published_parsed[:6]),
                            "source": feed_config["source"],
                            "source_name": feed_config["name"],
                        }
                        news.append(item)
                    except Exception as e:
                        logger.warning(f"Error parsing RSS entry: {e}")
                        continue

            except Exception as e:
                logger.error(f"RSS Feed error ({feed_config['name']}): {e}")

        logger.info(f"Collected {len(news)} RSS items")
        return news

    async def process_and_store(self, raw_news_items: List[Dict]) -> List[str]:
        """
        Verarbeite rohe News-Items:
        1. Klassifiziere mit NLP
        2. Extrahiere Entities
        3. Speichere in DB
        4. Sende Alerts an Nutzer

        Returns: Liste von Alert-IDs
        """
        alert_ids = []

        for item in raw_news_items:
            try:
                # NLP Klassifikation
                alert_type, priority, relevance = classify_news(
                    item["description"], item["title"]
                )

                # Entities extrahieren
                entities = extract_entities(item["description"])

                # Impact berechnen
                impact_score = calculate_impact_score(alert_type, entities)

                # In DB speichern
                if self.db:
                    alert = NewsAlert(
                        id=self._generate_id(),
                        alert_type=alert_type,
                        priority=priority,
                        source=item.get("source", NewsSource.RSS),
                        title=item["title"],
                        description=item["description"],
                        raw_text=item["description"],
                        relevance_score=relevance,
                        confidence=impact_score,
                        nlp_tags=str(entities),
                        team_id=entities["teams"][0] if entities["teams"] else None,
                        player_id=entities["players"][0]
                        if entities["players"]
                        else None,
                        source_url=item.get("source_url"),
                        published_at=item.get("published_at", datetime.utcnow()),
                        expires_at=datetime.utcnow() + timedelta(days=7),
                    )

                    self.db.add(alert)
                    alert_ids.append(alert.id)

                    logger.info(
                        f"Alert created: {alert.title[:50]} | "
                        f"{alert_type.value} | {priority.value} | Score: {relevance:.2f}"
                    )

            except Exception as e:
                logger.error(f"Error processing news item: {e}")

        if self.db:
            self.db.commit()

        return alert_ids

    def _generate_id(self) -> str:
        """Generiere eindeutige Alert-ID"""
        import uuid

        return f"alert_{uuid.uuid4().hex[:8]}"


async def run_news_collection_worker(db_session, poll_interval: int = 300):
    """
    Dauerhafter Worker: Alle N Sekunden News sammeln & verarbeiten

    Args:
        db_session: SQLAlchemy async session
        poll_interval: Sekunden zwischen Polls (default: 5 Min)
    """
    logger.info(f"Starting news collection worker (interval: {poll_interval}s)")

    while True:
        try:
            async with NewsCollector(db_session) as collector:
                # Sammle aus allen Quellen
                raw_news = await collector.collect_all_sources()

                # Verarbeite & speichere
                if raw_news:
                    alert_ids = await collector.process_and_store(raw_news)
                    logger.info(
                        f"Created {len(alert_ids)} alerts from {len(raw_news)} news items"
                    )

        except Exception as e:
            logger.error(f"News collection worker error: {e}")

        # Warte vor nächstem Poll
        await asyncio.sleep(poll_interval)
