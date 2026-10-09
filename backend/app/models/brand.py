from sqlalchemy import Column, Integer, String, Boolean, Text
from app.core.database import Base


class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    official_domains = Column(Text, nullable=False)  # JSON or comma-separated list of domains
    known_keywords = Column(Text, nullable=False)    # JSON or comma-separated list of keywords
    category = Column(String(50), nullable=False)    # banking, technology, ecommerce, government, delivery
    is_high_target = Column(Boolean, default=True)
