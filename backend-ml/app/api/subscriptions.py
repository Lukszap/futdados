from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
# import stripe  # Commented out - Stripe not installed

from app.database import get_db
from app.models.database import Club, SubscriptionPlan, SubscriptionStatus
from app.api.auth import get_current_club
from app.config import settings
from pydantic import BaseModel


router = APIRouter()

# Initialize Stripe
# stripe.api_key = settings.STRIPE_API_KEY  # Commented out - Stripe not installed


class SubscriptionCreate(BaseModel):
    plan: SubscriptionPlan


class SubscriptionResponse(BaseModel):
    subscription_status: str
    subscription_plan: str
    subscription_end_date: str = None

    class Config:
        from_attributes = True


@router.post("/create-checkout-session")
async def create_checkout_session(
    subscription_data: SubscriptionCreate,
    current_club: Club = Depends(get_current_club),
    db: Session = Depends(get_db)
):
    """Create Stripe checkout session for subscription"""
    # TODO: Implement when Stripe is installed
    raise HTTPException(status_code=501, detail="Stripe not installed - payment features disabled")


@router.get("/", response_model=SubscriptionResponse)
async def get_subscription(current_club: Club = Depends(get_current_club)):
    return current_club


@router.post("/cancel")
async def cancel_subscription(current_club: Club = Depends(get_current_club), db: Session = Depends(get_db)):
    """Cancel subscription (keeps access until end of billing period)"""
    if current_club.stripe_customer_id:
        try:
            # Cancel subscription in Stripe
            customer = stripe.Customer.retrieve(current_club.stripe_customer_id)
            if customer.subscriptions:
                subscription = customer.subscriptions.data[0]
                stripe.Subscription.delete(subscription.id)

            # Update in database
            current_club.subscription_status = SubscriptionStatus.CANCELLED
            db.commit()

        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Subscription cancelled"}


@router.post("/webhook")
async def stripe_webhook():
    """Handle Stripe webhooks for subscription events"""
    # TODO: Implement webhook handling for subscription.updated, subscription.deleted, etc.
    return {"message": "Webhook received"}
