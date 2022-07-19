from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent.parent
SRC_ROOT = REPO_ROOT / "src"
TESTS_ROOT = REPO_ROOT / "tests"

CAIRO_PATH = str(SRC_ROOT)

PATH_ACCOUNT = str(SRC_ROOT / "Account.cairo")

PATH_MOCK_AIRDROP = str(TESTS_ROOT / "mocks" / "MockAirdrop.cairo")
