"""Validated state, Union Territory, and district seed data source.

The source is a public JSON distribution whose current snapshot contains the
36 entities and 784 districts reported by India's Local Government Directory.
The loader validates those totals before any database writes are attempted.
"""

from collections.abc import Iterator
import json
from urllib.request import urlopen

LOCATION_DATA_URL = (
    "https://raw.githubusercontent.com/sanjaynishad/Indian-States-And-Districts/"
    "master/dist/Indian-state-name-districts.json"
)
EXPECTED_STATE_COUNT = 36
EXPECTED_DISTRICT_COUNT = 784
UNION_TERRITORIES = {
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
}


def load_location_data() -> dict[str, tuple[bool, tuple[str, ...]]]:
    with urlopen(LOCATION_DATA_URL, timeout=30) as response:
        raw_data = json.load(response)

    if not isinstance(raw_data, dict):
        raise ValueError("Location data must be a state-to-district JSON object")

    locations: dict[str, tuple[bool, tuple[str, ...]]] = {}
    for state_name, districts in raw_data.items():
        if not isinstance(state_name, str) or not isinstance(districts, list):
            raise ValueError("Location data contains an invalid state entry")
        cleaned_districts = tuple(sorted({name.strip() for name in districts if name.strip()}))
        state_name = state_name.strip()
        locations[state_name] = (state_name in UNION_TERRITORIES, cleaned_districts)

    district_count = sum(len(districts) for _, districts in locations.values())
    if len(locations) != EXPECTED_STATE_COUNT or district_count != EXPECTED_DISTRICT_COUNT:
        raise ValueError(
            f"Unexpected location totals: {len(locations)} states and {district_count} districts"
        )
    return locations


def iter_location_data() -> Iterator[tuple[str, bool, str]]:
    for state_name, (is_union_territory, districts) in load_location_data().items():
        for district_name in districts:
            yield state_name, is_union_territory, district_name
