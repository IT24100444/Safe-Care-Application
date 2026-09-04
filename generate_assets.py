import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs("assets", exist_ok=True)

def create_architecture_diagram():
    width, height = 1920, 1080
    image = Image.new("RGB", (width, height), "#0B1120")
    draw = ImageDraw.Draw(image)

    # Grid / tech lines
    for x in range(0, width, 80):
        draw.line([(x, 0), (x, height)], fill="#1E293B", width=1)
    for y in range(0, height, 80):
        draw.line([(0, y), (width, y)], fill="#1E293B", width=1)

    # Title Banner
    draw.rectangle([(60, 40), (1860, 120)], fill="#0F172A", outline="#38BDF8", width=3)
    draw.text((100, 60), "CareRoute LK — Workflow Architecture", fill="#F8FAFC", font_size=40)
    draw.text((1200, 68), "ADK 2.0 Multi-Agent + MCP Server", fill="#38BDF8", font_size=28)

    # Helper function for card draw
    def draw_card(x, y, w, h, title, subtitle, border_color, fill_color="#1E293B"):
        draw.rectangle([(x-4, y-4), (x+w+4, y+h+4)], fill=border_color)
        draw.rectangle([(x, y), (x+w, y+h)], fill=fill_color, outline=border_color, width=2)
        draw.text((x+20, y+20), title, fill="#F8FAFC", font_size=26)
        draw.text((x+20, y+65), subtitle, fill="#94A3B8", font_size=18)

    # 1. Security Checkpoint Node (Top Center)
    draw_card(710, 160, 500, 120, "🛡️ Security Checkpoint", "PII Scrub + Injection Detect + 1990 Intercept", "#F97316", "#1E1B4B")

    # 2. CareRoute Orchestrator (Center)
    draw_card(710, 360, 500, 120, "🤖 CareRoute Orchestrator", "safe_care_orchestrator (ADK LlmAgent)", "#06B6D4", "#083344")

    # 3. Sub-Agent 1: Facility Care Specialist (Left)
    draw_card(260, 560, 440, 140, "🏥 Facility Care Specialist", "facility_care_specialist\nDistrict & Health Services Resolution", "#10B981", "#064E3B")

    # 4. Sub-Agent 2: Doctor Schedule Specialist (Center-Right)
    draw_card(760, 560, 440, 140, "👨‍⚕️ Doctor Schedule Specialist", "doctor_schedule_specialist\nDoctor Specialization & Slots", "#8B5CF6", "#312E81")

    # 5. Human-in-the-Loop Node (Right)
    draw_card(1260, 560, 400, 140, "✋ Human Confirmation", "Explicit user approval before write\nRequestInput Proposal Flow", "#3B82F6", "#1E3A8A")

    # 6. MCP Server Panel (Bottom Full Width)
    draw.rectangle([(260, 780), (1660, 1000)], fill="#0F172A", outline="#EC4899", width=3)
    draw.text((290, 800), "🔌 CareRoute MCP Server (app/mcp_server.py)", fill="#F472B6", font_size=26)
    
    tools = [
        "1. list_health_services",
        "2. search_facilities",
        "3. get_facility_details",
        "4. search_doctors",
        "5. get_doctor_availability"
    ]
    for idx, t in enumerate(tools):
        draw.rectangle([(290 + idx*270, 860), (290 + idx*270 + 250, 960)], fill="#1E293B", outline="#64748B", width=2)
        draw.text((305 + idx*270, 895), t, fill="#E2E8F0", font_size=17)

    # Arrows (Connecting Lines)
    draw.line([(960, 280), (960, 360)], fill="#F97316", width=4) # Security -> Orchestrator
    draw.line([(710, 420), (480, 560)], fill="#06B6D4", width=4) # Orchestrator -> Facility Agent
    draw.line([(960, 480), (980, 560)], fill="#06B6D4", width=4) # Orchestrator -> Doctor Agent
    draw.line([(1210, 420), (1460, 560)], fill="#3B82F6", width=4) # Orchestrator -> HITL
    draw.line([(480, 700), (480, 780)], fill="#10B981", width=3)  # Facility Agent -> MCP
    draw.line([(980, 700), (980, 780)], fill="#8B5CF6", width=3)  # Doctor Agent -> MCP

    image.save("assets/architecture_diagram.png")
    print("Saved assets/architecture_diagram.png")

def create_cover_banner():
    width, height = 1920, 1080
    image = Image.new("RGB", (width, height), "#030712")
    draw = ImageDraw.Draw(image)

    # Decorative Glowing Circles & Gradient Effects
    for r in range(400, 0, -20):
        draw.ellipse([(1400-r, 540-r), (1400+r, 540+r)], fill=None, outline="#1E1B4B", width=2)
        draw.ellipse([(1500-r, 440-r), (1500+r, 440+r)], fill=None, outline="#0F766E", width=1)

    # Main Header Text
    draw.text((120, 280), "CAREROUTE LK", fill="#FFFFFF", font_size=76)
    draw.text((125, 390), "Sri Lanka Healthcare Navigation & Recommendation Agent", fill="#38BDF8", font_size=34)
    draw.text((125, 450), "Automated | Clinical Safety Intercepts | Node.js API Integration", fill="#94A3B8", font_size=24)

    # Feature Badges
    features = [
        ("🤖 ADK Multi-Agent", "Orchestrator + 2 LlmAgents"),
        ("🔌 MCP Server", "5 Domain-Specific Tools"),
        ("🛡️ Security & 1990", "PII Scrub + Emergency Intercept"),
        ("🧪 15/15 Pytest Passed", "Deterministic Verification Suite")
    ]

    for i, (title, sub) in enumerate(features):
        x = 120 + (i % 2) * 440
        y = 560 + (i // 2) * 160
        draw.rectangle([(x, y), (x+400, y+130)], fill="#0F172A", outline="#6366F1", width=3)
        draw.text((x+25, y+25), title, fill="#F8FAFC", font_size=24)
        draw.text((x+25, y+70), sub, fill="#CBD5E1", font_size=18)

    # Footer line
    draw.rectangle([(0, 1040), (1920, 1080)], fill="#4F46E5")
    draw.text((120, 1048), "Built with Google Agent Development Kit (ADK) 2.0 & FastMCP", fill="#FFFFFF", font_size=20)

    image.save("assets/cover_page_banner.png")
    print("Saved assets/cover_page_banner.png")

if __name__ == "__main__":
    create_architecture_diagram()
    create_cover_banner()
