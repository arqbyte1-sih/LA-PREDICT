from pathlib import Path
import sys

from sqlalchemy import select

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.data.location_data import load_location_data
from app.database.connection import SessionLocal
from app.database.init_db import init_db
from app.models.district import District
from app.models.state import State


def seed_locations() -> tuple[int, int]:
    init_db()
    locations = load_location_data()
    state_count = 0
    district_count = 0

    with SessionLocal() as db:
        for state_name, (is_union_territory, district_names) in locations.items():
            state = db.scalar(select(State).where(State.name == state_name))
            if state is None:
                state = State(name=state_name, is_union_territory=is_union_territory)
                db.add(state)
                db.flush()
                state_count += 1

            existing_names = set(
                db.scalars(select(District.name).where(District.state_id == state.id)).all()
            )
            for district_name in district_names:
                if district_name not in existing_names:
                    db.add(District(state_id=state.id, name=district_name))
                    district_count += 1
        db.commit()

    return state_count, district_count


if __name__ == "__main__":
    added_states, added_districts = seed_locations()
    print(f"Location seed complete: added {added_states} states/UTs and {added_districts} districts.")
