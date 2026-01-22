import google.generativeai as genai
from google.generativeai.types import FunctionDeclaration, Tool
import database
import logic

genai.configure(api_key="AIzaSyBYYZtioJ8Y_l0YFyk9FYbjY-p14VLmT4Q")

def get_chat_response(user_input: str, user_info: dict, history: list = []):
    tools = Tool(function_declarations=[
        FunctionDeclaration(
            name="check_availability",
            description="Find available appointment slots for a specific date.",
            parameters={"type": "object", "properties": {"date": {"type": "string"}}, "required": ["date"]}
        ),
        FunctionDeclaration(
            name="book_appointment",
            description="Book an appointment slot.",
            parameters={"type": "object", "properties": {"datetime_iso": {"type": "string"}}, "required": ["datetime_iso"]}
        )
    ])

    model = genai.GenerativeModel(
        model_name='gemini-3-flash-preview',
        tools=[tools],
        system_instruction=(
            f"You are the assistant for Sneha's Homeopathic Clinic. Greeting user: {user_info['name']}. "
            "When a user picks a time, you MUST remember the date discussed earlier in the history "
            "to create the full ISO string (YYYY-MM-DDTHH:MM:SS) for booking."
        )
    )

    # Convert frontend history to Gemini format
    formatted_history = []
    for msg in history:
        role = "user" if msg['sender'] == "user" else "model"
        formatted_history.append({"role": role, "parts": [msg['text']]})

    # Start chat with memory
    chat = model.start_chat(history=formatted_history, enable_automatic_function_calling=False)
    response = chat.send_message(user_input)
    
    part = response.candidates[0].content.parts[0]
    
    if part.function_call:
        call = part.function_call
        if call.name == "check_availability":
            date_str = call.args['date']
            slots = logic.get_available_slots(date_str)
            clean_slots = [s.split("T")[1][:5] for s in slots if "T" in s]
            return f"For {date_str}, we have: {', '.join(clean_slots)}. Which one works?"

        if call.name == "book_appointment":
            slot = call.args['datetime_iso']
            b_id = database.add_appointment(user_info['id'], slot)
            return f"Confirmed! Booking ID: {b_id} for {slot.replace('T', ' at ')}."

    return response.text