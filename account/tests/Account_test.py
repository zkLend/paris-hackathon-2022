import pytest

from utils.contracts import CAIRO_PATH, PATH_ACCOUNT, PATH_MOCK_AIRDROP

from starkware.starknet.public.abi import get_selector_from_name
from starkware.starknet.testing.starknet import Starknet


@pytest.mark.asyncio
async def test_sanity():
    starknet = await Starknet.empty()

    account = await starknet.deploy(
        source=PATH_ACCOUNT,
        constructor_calldata=[
            int("0x250511e01680978f6780c84a76b605cdc82defae", 16),  # _eth_address
        ],
        contract_address_salt=1,
        cairo_path=[CAIRO_PATH],
    )

    airdrop = await starknet.deploy(
        source=PATH_MOCK_AIRDROP,
        constructor_calldata=[],
        contract_address_salt=1,
        cairo_path=[CAIRO_PATH],
    )

    await account.__execute__(
        [
            (
                airdrop.contract_address,  # to
                get_selector_from_name("claim_airdrop"),  # selector
                0,  # data_offset
                2,  # data_len
            )
        ],
        [1, 2],
        0,
    ).invoke(
        max_fee=0,
        # 0xfe87b9e0ab018d339c4411d40a0c8be43dbfa16e09dc0c266d2e0506d98fbd34645ebf24806157b3b2de532f9208fdffa49d2f83e7f2cf7ece1b70828aa4cfe31b
        signature=[
            27 - 27,
            82077910628955470958145570672978410804,
            338328641051079724612646459841991969764,
            218809545639441409277122542426556518371,
            133414752315373770292404517302780362239,
        ],
    )
