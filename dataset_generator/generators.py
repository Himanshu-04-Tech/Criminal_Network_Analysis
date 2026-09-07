"""Generators for synthetic Entities, FIR Cases, and Forensic Evidence."""

from __future__ import annotations
import random
from typing import Dict, List, Tuple
from faker import Faker

from dataset_generator.models import (
    Entity,
    EntityType,
    Case,
    CaseStatus,
    Evidence,
)

# Seed Faker for reproducible yet realistic synthetic data
fake = Faker("en_IN")
Faker.seed(42)
random.seed(42)


class EntityGenerator:
    """Generates 126 investigation entities conforming to NEXUS-Bharat requirements."""

    def __init__(self, base_date: str = "2026-06-01T00:00:00Z"):
        self.base_date = base_date

    def generate_persons(self) -> List[Entity]:
        """Generate exactly 35 Person entities with special roles for intelligence patterns."""
        persons: List[Entity] = []

        # Explicit roles and specifications
        special_names: Dict[str, Tuple[str, Dict[str, str]]] = {
            # Community A (Pattern 1)
            "P001": ("Vikram Singhania", {"role": "Community A Leader", "city": "Delhi", "dob": "1982-05-14"}),
            "P002": ("Arjun Verma", {"role": "Community A Operative", "city": "Delhi", "dob": "1987-11-20"}),
            "P003": ("Rajesh Pandey", {"role": "Community A Financier", "city": "Noida", "dob": "1979-03-08"}),
            "P004": ("Amitabh Sen", {"role": "Community A Communicator", "city": "Gurugram", "dob": "1985-09-12"}),
            # Shared Phone Suspect 1 (Pattern 2)
            "P005": ("Suresh Nair", {"role": "Primary Suspect (FIR002)", "city": "Mumbai", "dob": "1990-07-22"}),
            # Cross-Case Bridge Persons (Pattern 4)
            "P006": ("Karan Malhotra", {"role": "Inter-case Liaison", "city": "Delhi", "dob": "1984-12-05"}),
            "P007": ("Deepak Joshi", {"role": "Procurement Informant (FIR007)", "city": "Chandigarh", "dob": "1981-04-18"}),
            # Community B (Pattern 1)
            "P010": ("Tariq Ahmed", {"role": "Community B Leader", "city": "Mumbai", "dob": "1980-08-30"}),
            "P011": ("Imran Qureshi", {"role": "Community B Courier", "city": "Thane", "dob": "1989-02-14"}),
            "P012": ("Faizan Sheikh", {"role": "Community B Handler", "city": "Navi Mumbai", "dob": "1983-06-25"}),
            "P013": ("Bilal Khan", {"role": "Community B Money Mule", "city": "Pune", "dob": "1992-10-10"}),
            # Hidden Broker (Pattern 1)
            "P017": ("Anand Deshmukh", {"role": "Hidden Inter-Community Broker", "city": "Indore", "dob": "1976-01-19"}),
            # Shared Phone Suspect 2 (Pattern 2)
            "P018": ("Harpreet Singh", {"role": "Transport Coordinator (FIR005)", "city": "Amritsar", "dob": "1988-09-03"}),
            # Alias Persons (Pattern 9) - distinct entity nodes representing same real-world identity
            "P025": ("Rahul Sharma", {"alias_group": "GRP_RAHUL_SHARMA", "dob": "1988-04-12", "pan_hint": "ABCP****1R"}),
            "P026": ("R Sharma", {"alias_group": "GRP_RAHUL_SHARMA", "dob": "1988-04-12", "pan_hint": "ABCP****1R"}),
            "P027": ("Rahul S", {"alias_group": "GRP_RAHUL_SHARMA", "dob": "1988-04-12", "pan_hint": "ABCP****1R"}),
        }

        # Background Indian names for remainder
        background_names = [
            "Manoj Tiwari", "Gaurav Mehta", "Sanjay Chauhan", "Nitin Gadve", "Pooja Batra",
            "Sunita Yadav", "Kavita Rao", "Ashok Kulkarni", "Prashant Patil", "Dinesh Aggarwal",
            "Neeraj Chopra", "Mohan Lal", "Vikas Swarup", "Rohan Bhattacharya", "Sandhya Pillai",
            "Hemant Soren", "Balwinder Sandhu", "Chetan Bhagat", "Girish Karnad"
        ]
        bg_idx = 0

        for i in range(1, 36):
            pid = f"P{i:03d}"
            created_at = f"2026-06-{(i % 28) + 1:02d}T10:00:00Z"
            if pid in special_names:
                name, attrs = special_names[pid]
                persons.append(Entity(
                    id=pid,
                    type=EntityType.PERSON.value,
                    name=name,
                    created_at=created_at,
                    attributes=attrs
                ))
            else:
                name = background_names[bg_idx % len(background_names)]
                bg_idx += 1
                persons.append(Entity(
                    id=pid,
                    type=EntityType.PERSON.value,
                    name=name,
                    created_at=created_at,
                    attributes={"city": fake.city(), "role": "Associate / Witness / Suspect"}
                ))

        return persons

    def generate_phones(self) -> List[Entity]:
        """Generate exactly 45 Phone entities with realistic MSISDNs, IMEIs, and Carriers."""
        phones: List[Entity] = []
        carriers = ["Airtel India", "Reliance Jio", "Vodafone Idea", "BSNL"]

        for i in range(1, 46):
            ph_id = f"PH{i:03d}"
            # Indian mobile format (+91 98xxxxxxx)
            msisdn = f"+9198{random.randint(10000000, 99999999)}"
            imei = f"86{random.randint(1000000000000, 9999999999999)}"
            carrier = carriers[i % len(carriers)]
            created_at = f"2026-06-{(i % 28) + 1:02d}T11:30:00Z"

            phones.append(Entity(
                id=ph_id,
                type=EntityType.PHONE.value,
                name=f"Mobile ({msisdn})",
                created_at=created_at,
                attributes={
                    "phone_number": msisdn,
                    "imei": imei,
                    "carrier": carrier,
                    "device_type": "Smartphone" if i % 3 != 0 else "Feature Phone (Burner)"
                }
            ))

        return phones

    def generate_accounts(self) -> List[Entity]:
        """Generate exactly 20 Bank Account entities with Indian Bank names and IFSC codes."""
        accounts: List[Entity] = []
        banks = [
            ("State Bank of India", "SBIN0001423"),
            ("HDFC Bank", "HDFC0000128"),
            ("ICICI Bank", "ICIC0000452"),
            ("Punjab National Bank", "PUNB0123400"),
            ("Axis Bank", "UTIB0000876"),
        ]

        for i in range(1, 21):
            acc_id = f"ACC{i:03d}"
            bank_name, ifsc = banks[i % len(banks)]
            acc_num = f"{random.randint(10000000000, 99999999999)}"
            acc_type = "CURRENT" if i in (1, 9, 12, 17) else "SAVINGS"
            created_at = f"2026-06-{(i % 28) + 1:02d}T09:15:00Z"

            accounts.append(Entity(
                id=acc_id,
                type=EntityType.ACCOUNT.value,
                name=f"{bank_name} - {acc_num[-4:]}",
                created_at=created_at,
                attributes={
                    "account_number": acc_num,
                    "bank_name": bank_name,
                    "ifsc_code": ifsc,
                    "account_type": acc_type
                }
            ))

        return accounts

    def generate_vehicles(self) -> List[Entity]:
        """Generate exactly 10 Vehicle entities with Indian RTO registration plates."""
        vehicles: List[Entity] = []
        vehicle_templates = [
            ("Mahindra Scorpio-N", "White", "DL-01-AB-1234"),
            ("Toyota Fortuner", "Black", "MH-12-CD-5678"),
            ("Hyundai Creta SX", "Silver", "HR-26-EF-9012"),  # VEH003: Shared across FIR003 and FIR008
            ("Maruti Suzuki Swift", "Red", "UP-16-GH-3456"),
            ("Tata Nexon EV", "Blue", "KA-05-JK-7890"),
            ("Kia Seltos", "Grey", "GJ-01-LM-2345"),
            ("Honda City ZX", "White", "RJ-14-NP-6789"),
            ("Mahindra Bolero Camper", "Brown", "WB-02-RS-1357"),
            ("Isuzu D-Max V-Cross", "Black", "TN-09-TU-2468"),
            ("Toyota Innova Crysta", "Silver", "CH-01-VW-3579"),
        ]

        for i in range(1, 11):
            veh_id = f"VEH{i:03d}"
            model, color, reg_no = vehicle_templates[i - 1]
            created_at = f"2026-06-{(i % 28) + 1:02d}T14:20:00Z"

            vehicles.append(Entity(
                id=veh_id,
                type=EntityType.VEHICLE.value,
                name=f"{color} {model} ({reg_no})",
                created_at=created_at,
                attributes={
                    "registration_number": reg_no,
                    "model": model,
                    "color": color,
                    "category": "Four Wheeler"
                }
            ))

        return vehicles

    def generate_locations(self) -> List[Entity]:
        """Generate exactly 10 Location entities with coordinates and strategic operational roles."""
        locations: List[Entity] = []
        location_data = [
            ("Connaught Place Hub, New Delhi", "DELHI", 28.6329, 77.2195, "FINANCIAL_DISTRICT"),
            ("Bandra Kurla Complex (BKC), Mumbai", "MUMBAI", 19.0657, 72.8687, "FINANCIAL_DISTRICT"),
            ("Dhaula Kuan Highway Toll Plaza, Delhi", "DELHI", 28.5912, 77.1610, "HIGHWAY_CHECKPOINT"),  # FIR003
            ("Nhava Sheva Container Port, Navi Mumbai", "NAVI_MUMBAI", 18.9499, 72.9511, "SEA_PORT"),
            ("Sector 62 Industrial Warehouse Area, Noida", "NOIDA", 28.6258, 77.3730, "WAREHOUSE"),
            ("Chandni Chowk Bullion Market, Old Delhi", "DELHI", 28.6562, 77.2307, "HAWALA_ZONE"),
            ("Cyber City Gateway Tower, Gurugram", "GURUGRAM", 28.4952, 77.0891, "CORPORATE_PARK"),
            ("Wagah Border Logistics Depot, Amritsar", "AMRITSAR", 31.6046, 74.5724, "BORDER_TRANSIT"),  # FIR008
            ("Zaveri Bazaar Gold Market, Mumbai", "MUMBAI", 18.9514, 72.8315, "GOLD_TRADING"),
            ("Kempegowda Inter-State Bus Terminal, Bengaluru", "BENGALURU", 12.9774, 77.5708, "TRANSIT_HUB"),
        ]

        for i in range(1, 11):
            loc_id = f"LOC{i:03d}"
            name, city, lat, lon, loc_type = location_data[i - 1]
            created_at = f"2026-06-{(i % 28) + 1:02d}T08:00:00Z"

            locations.append(Entity(
                id=loc_id,
                type=EntityType.LOCATION.value,
                name=name,
                created_at=created_at,
                attributes={
                    "city": city,
                    "latitude": lat,
                    "longitude": lon,
                    "location_type": loc_type
                }
            ))

        return locations

    def generate_organizations(self) -> List[Entity]:
        """Generate exactly 6 Organization entities representing front companies and trusts."""
        organizations: List[Entity] = []
        org_data = [
            ("Apex Freight Logistics Pvt Ltd", "LOGISTICS", "U63090DL2018PTC334512"),  # Community A front
            ("Silverline Global Trading LLP", "IMPORT_EXPORT", "AAB-8912"),              # Community B front
            ("Kuber Bullion & Financial Exchange", "MONEY_SERVICES", "MH-4019238"),       # Hidden Broker broker
            ("Bharat Janhit Charitable Foundation", "TRUST_NGO", "TR-DL-2015-891"),      # Money laundering front
            ("Skyline Realcon & Infra Consortium", "REAL_ESTATE", "U45200HR2020PTC44101"),# Benami land holding
            ("Speedway Auto Rental Solutions", "VEHICLE_RENTAL", "U50100MH2019PTC29182"),# Vehicle supply cover
        ]

        for i in range(1, 7):
            org_id = f"ORG{i:03d}"
            name, cat, reg_id = org_data[i - 1]
            created_at = f"2026-06-{(i % 28) + 1:02d}T12:00:00Z"

            organizations.append(Entity(
                id=org_id,
                type=EntityType.ORGANIZATION.value,
                name=name,
                created_at=created_at,
                attributes={
                    "category": cat,
                    "registration_number": reg_id,
                    "registered_state": "Delhi" if i % 2 == 1 else "Maharashtra"
                }
            ))

        return organizations

    def generate_all_entities(self) -> List[Entity]:
        """Generate full suite of 126 entities."""
        all_entities = []
        all_entities.extend(self.generate_persons())       # 35
        all_entities.extend(self.generate_phones())        # 45
        all_entities.extend(self.generate_accounts())      # 20
        all_entities.extend(self.generate_vehicles())      # 10
        all_entities.extend(self.generate_locations())     # 10
        all_entities.extend(self.generate_organizations()) # 6
        return all_entities


class CaseGenerator:
    """Generates exactly 10 FIR Criminal Cases (FIR001 to FIR010)."""

    def generate_cases(self) -> List[Case]:
        case_records = [
            ("FIR001", "Interstate Cyber Financial Fraud & Extortion Syndicate", CaseStatus.OPEN.value, "2026-06-15T09:30:00Z"),
            ("FIR002", "Underground Hawala Money Routing & Currency Smuggling", CaseStatus.UNDER_INVESTIGATION.value, "2026-06-28T14:15:00Z"),
            ("FIR003", "Interstate Luxury Vehicle Theft & Resale Racket", CaseStatus.UNDER_INVESTIGATION.value, "2026-07-04T11:00:00Z"),
            ("FIR004", "Narcotics Distribution Cell & High-Volume Call Spoofing", CaseStatus.OPEN.value, "2026-07-18T16:45:00Z"),
            ("FIR005", "Highway Logistics Hijack & Goods Diversion Syndicate", CaseStatus.UNDER_INVESTIGATION.value, "2026-07-29T10:20:00Z"),
            ("FIR006", "Shell Company Invoicing & Tax Evasion Racket", CaseStatus.OPEN.value, "2026-08-02T13:40:00Z"),
            ("FIR007", "Public Infrastructure Bid Rigging & Kickback Scheme", CaseStatus.UNDER_INVESTIGATION.value, "2026-08-08T15:10:00Z"),
            ("FIR008", "Cross-Border Contraband Smuggling & Covert Transit", CaseStatus.CLOSED.value, "2026-08-11T17:00:00Z"),
            ("FIR009", "SIM Box Operation & Telecom Identity Impersonation", CaseStatus.OPEN.value, "2026-08-14T11:30:00Z"),
            ("FIR010", "Benami Real Estate Land Grabbing & Coercion", CaseStatus.CLOSED.value, "2026-08-16T12:00:00Z"),
        ]

        return [
            Case(id=cid, title=title, status=status, created_at=created_at)
            for cid, title, status, created_at in case_records
        ]


class EvidenceGenerator:
    """Generates realistic evidence records tied to FIR cases."""

    def __init__(self):
        self._evidence_counter = 0

    def create_evidence(
        self,
        case_id: str,
        source_file: str,
        timestamp: str,
        confidence: float = 1.0,
        description: str = ""
    ) -> Evidence:
        """Create and return a uniquely numbered Evidence record."""
        self._evidence_counter += 1
        ev_id = f"E{self._evidence_counter:03d}"
        return Evidence(
            id=ev_id,
            case_id=case_id,
            source_file=source_file,
            timestamp=timestamp,
            confidence=confidence,
            description=description or f"Forensic artifact for {case_id}"
        )
