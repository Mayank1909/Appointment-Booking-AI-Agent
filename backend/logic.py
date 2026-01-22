# logic.py
from datetime import datetime, timedelta
from dateutil import parser

# --- CONFIGURATION ---
BUSINESS_HOURS = {"start": 10, "end": 18} # 10 AM to 6 PM (Modern Clinic Hours)
SLOT_DURATION = 30 # minutes
BREAK_TIMES = [13] # 1 PM lunch break

def get_available_slots(date_str: str):
    """Generates 30-min slots and removes booked/break times."""
    # 1. Import inside the function to avoid Circular Import errors
    from database import get_all_booked_slots
    
    slots = []
    try:
        current_date = parser.parse(date_str).date()
    except Exception:
        return ["Invalid date format. Please use YYYY-MM-DD."]

    # Set the start and end of the working day
    start_time = datetime.combine(current_date, datetime.min.time()).replace(hour=BUSINESS_HOURS["start"])
    end_time = datetime.combine(current_date, datetime.min.time()).replace(hour=BUSINESS_HOURS["end"])
    
    # Get all booked slots (regardless of user) for this date
    booked_slots = get_all_booked_slots(date_str)
    
    while start_time < end_time:
        # Business Logic: Skip lunch break
        if start_time.hour in BREAK_TIMES:
            start_time += timedelta(minutes=SLOT_DURATION)
            continue
            
        slot_iso = start_time.isoformat()
        
        # Business Logic: Only add if not already in the database
        # We check if the generated slot is in our booked list
        if slot_iso not in booked_slots:
            # We store the full ISO for booking, but the LLM will 
            # display it nicely to the user.
            slots.append(slot_iso)
        
        start_time += timedelta(minutes=SLOT_DURATION)
    
    # If no slots are left
    if not slots:
        return ["Fully booked for this date."]
        
    return slots