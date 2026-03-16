from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import anthropic
import json
import re

app = FastAPI(title="CubeAI Solver API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ───────────────────────────────────────────────

class CubeFace(BaseModel):
    name: str
    short: str
    cells: List[Optional[str]]

class SolveRequest(BaseModel):
    size: int
    faces: List[CubeFace]
    api_key: str

class MoveInfo(BaseModel):
    move: str
    face: str
    direction: str
    arrow: str

class SolveResponse(BaseModel):
    algorithm: str
    moves: List[str]
    total_moves: int
    explanation: str
    move_details: List[MoveInfo]

# ─── Move metadata ────────────────────────────────────────

MOVE_DESC = {
    "U":   ("Top face",          "90° clockwise",         "↻"),
    "U'":  ("Top face",          "90° counter-clockwise", "↺"),
    "U2":  ("Top face",          "180°",                  "⟳"),
    "D":   ("Bottom face",       "90° clockwise",         "↻"),
    "D'":  ("Bottom face",       "90° counter-clockwise", "↺"),
    "D2":  ("Bottom face",       "180°",                  "⟳"),
    "L":   ("Left face",         "90° clockwise",         "↻"),
    "L'":  ("Left face",         "90° counter-clockwise", "↺"),
    "L2":  ("Left face",         "180°",                  "⟳"),
    "R":   ("Right face",        "90° clockwise",         "↻"),
    "R'":  ("Right face",        "90° counter-clockwise", "↺"),
    "R2":  ("Right face",        "180°",                  "⟳"),
    "F":   ("Front face",        "90° clockwise",         "↻"),
    "F'":  ("Front face",        "90° counter-clockwise", "↺"),
    "F2":  ("Front face",        "180°",                  "⟳"),
    "B":   ("Back face",         "90° clockwise",         "↻"),
    "B'":  ("Back face",         "90° counter-clockwise", "↺"),
    "B2":  ("Back face",         "180°",                  "⟳"),
    "M":   ("Middle layer",      "90° clockwise (like L)", "↕"),
    "M'":  ("Middle layer",      "90° counter-clockwise",  "↕"),
    "M2":  ("Middle layer",      "180°",                   "⟳"),
    "E":   ("Equatorial layer",  "90° clockwise (like D)", "↔"),
    "E'":  ("Equatorial layer",  "90° counter-clockwise",  "↔"),
    "S":   ("Standing layer",    "90° clockwise (like F)", "↔"),
    "S'":  ("Standing layer",    "90° counter-clockwise",  "↔"),
    "x":   ("Cube rotation",     "Along R axis",           "↕"),
    "y":   ("Cube rotation",     "Along U axis",           "↔"),
    "z":   ("Cube rotation",     "Along F axis",           "↻"),
    "Uw":  ("Top 2 layers",      "90° clockwise",          "↻"),
    "Uw'": ("Top 2 layers",      "90° counter-clockwise",  "↺"),
    "Dw":  ("Bottom 2 layers",   "90° clockwise",          "↻"),
    "Rw":  ("Right 2 layers",    "90° clockwise",          "↻"),
    "Lw":  ("Left 2 layers",     "90° clockwise",          "↻"),
    "Fw":  ("Front 2 layers",    "90° clockwise",          "↻"),
    "Bw":  ("Back 2 layers",     "90° clockwise",          "↻"),
}

def get_move_info(move: str) -> MoveInfo:
    data = MOVE_DESC.get(move, (move, "Turn", "↻"))
    return MoveInfo(move=move, face=data[0], direction=data[1], arrow=data[2])

# ─── Cube serializer ──────────────────────────────────────

def serialize_cube(size: int, faces: List[CubeFace]) -> str:
    lines = [f"{size}×{size} Rubik's Cube State:\n"]
    for face in faces:
        lines.append(f"\n{face.name} face ({face.short}):")
        for row in range(size):
            row_cells = face.cells[row * size:(row + 1) * size]
            row_str = "  " + " ".join(
                (c[0].upper() if c else "?") for c in row_cells
            )
            lines.append(row_str)
    return "\n".join(lines)

# ─── Routes ───────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "ok", "service": "CubeAI Solver API"}

@app.post("/solve", response_model=SolveResponse)
async def solve_cube(req: SolveRequest):
    if req.size not in (2, 3, 4):
        raise HTTPException(status_code=400, detail="Size must be 2, 3, or 4")
    if len(req.faces) != 6:
        raise HTTPException(status_code=400, detail="Must provide exactly 6 faces")

    n2 = req.size * req.size
    color_counts: dict = {}
    for face in req.faces:
        for cell in face.cells:
            if cell:
                color_counts[cell] = color_counts.get(cell, 0) + 1

    invalid_colors = {c: v for c, v in color_counts.items() if v != n2}
    if invalid_colors:
        detail = ", ".join(f"{c}: {v}/{n2}" for c, v in invalid_colors.items())
        raise HTTPException(status_code=422, detail=f"Invalid color counts: {detail}")

    cube_desc = serialize_cube(req.size, req.faces)

    prompt = f"""You are an expert Rubik's Cube solver. I have a {req.size}×{req.size} Rubik's Cube:

{cube_desc}

Color key: W=White, Y=Yellow, O=Orange, R=Red, B=Blue, G=Green

Provide a complete solution. Respond ONLY with valid JSON (no markdown, no extra text):
{{
  "algorithm": "Algorithm name",
  "moves": ["U", "R'", "F2"],
  "total_moves": 20,
  "explanation": "Brief strategy explanation"
}}

Rules:
- Use standard notation: U D L R F B with ' for CCW, 2 for 180°
- For {req.size}×{req.size}: use wide moves (Uw, Rw etc) if needed
- If already solved: return moves: []
- Optimize for fewest moves possible"""

    try:
        client = anthropic.Anthropic(api_key=req.api_key)
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = message.content[0].text

        json_match = re.search(r'\{[\s\S]*\}', raw)
        if not json_match:
            raise ValueError("No JSON in response")

        parsed = json.loads(json_match.group())
        moves = parsed.get("moves", [])

        return SolveResponse(
            algorithm=parsed.get("algorithm", "AI Solution"),
            moves=moves,
            total_moves=len(moves),
            explanation=parsed.get("explanation", ""),
            move_details=[get_move_info(m) for m in moves]
        )

    except anthropic.AuthenticationError:
        raise HTTPException(status_code=401, detail="Invalid Anthropic API key")
    except anthropic.RateLimitError:
        raise HTTPException(status_code=429, detail="Rate limit reached. Try again shortly.")
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"Anthropic API error: {str(e)}")
    except (ValueError, json.JSONDecodeError) as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/moves")
def list_moves():
    return {
        move: {"face": data[0], "direction": data[1], "arrow": data[2]}
        for move, data in MOVE_DESC.items()
    }

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

frontend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../frontend/dist")

@app.get("/health")
def health_check():
    return {"dist_exists": os.path.exists(frontend_path), "path": frontend_path}

if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
else:
    @app.get("/app")
    def no_frontend():
        return {"error": "Frontend not built", "looked_in": frontend_path}