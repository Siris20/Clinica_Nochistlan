from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings

# SQLAlchemy setup
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=32,
    max_overflow=64,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# MongoDB setup
mongodb_client: AsyncIOMotorClient = None

async def get_mongodb():
    return mongodb_client[settings.MONGODB_DATABASE]

# Dependency for SQL database
def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

# Connect to MongoDB
async def connect_to_mongodb():
    global mongodb_client
    mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)

# Close MongoDB connection
async def close_mongodb_connection():
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()