%lang starknet

from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin, BitwiseBuiltin
from starkware.cairo.common.cairo_keccak.keccak import keccak_add_uint256s, keccak_bigend
from starkware.cairo.common.cairo_secp.signature import verify_eth_signature_uint256
from starkware.cairo.common.math import split_felt
from starkware.cairo.common.registers import get_fp_and_pc
from starkware.cairo.common.uint256 import Uint256, uint256_add, uint256_shl, uint256_shr
from starkware.starknet.common.syscalls import get_contract_address, get_tx_info

from openzeppelin.account.library import Account, AccountCallArray

# 0x1901
const EIP712_PREFIX = 6401

# Empty domain separator
# keccak(keccak("EIP712Domain()"))
const DS_LOW = 238836402579337528575857678054303709857
const DS_HIGH = 129693524251123004137749162542084288169

# keccak("Call(uint256 account,uint256 nonce,uint256 max_fee,uint256 to,uint256 selector,uint256[] calldata)")
const TYPE_HASH_LOW = 69089272367167153724353107436494373356
const TYPE_HASH_HIGH = 153508920321517885920233904463402419778

@storage_var
func nonce() -> (res : felt):
end

@storage_var
func eth_address() -> (res : felt):
end

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    _eth_address : felt
):
    eth_address.write(_eth_address)
    return ()
end

@view
func get_nonce{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (res : felt):
    let (res) = nonce.read()
    return (res=res)
end

@view
func is_valid_signature(hash : felt, signature_len : felt, signature : felt*) -> (is_valid : felt):
    # For this POC we're not implementing this function
    assert 0 = 1
    return (is_valid=0)
end

@view
func compute_eip712_sighash{syscall_ptr : felt*, range_check_ptr, bitwise_ptr : BitwiseBuiltin*}(
    call_array_len : felt,
    call_array : AccountCallArray*,
    calldata_len : felt,
    calldata : felt*,
    nonce : felt,
) -> (hash : Uint256):
    alloc_locals

    let (value_hash) = hash_struct(call_array_len, call_array, calldata_len, calldata, nonce)
    let domain_separator = Uint256(DS_LOW, DS_HIGH)

    let prefix = Uint256(EIP712_PREFIX, 0)
    let (shifted_prefix) = uint256_shl(prefix, Uint256(256 - 16, 0))

    let (ds_high) = uint256_shr(domain_separator, Uint256(16, 0))
    let (ds_low_shifted) = uint256_shl(domain_separator, Uint256(256 - 16, 0))

    let (value_hash_high) = uint256_shr(value_hash, Uint256(16, 0))
    let (value_hash_low_shifted) = uint256_shl(value_hash, Uint256(256 - 16, 0))

    let (local elements : Uint256*) = alloc()

    let (element_0, _) = uint256_add(shifted_prefix, ds_high)
    assert elements[0] = element_0

    let (element_1, _) = uint256_add(ds_low_shifted, value_hash_high)
    assert elements[1] = element_1

    assert elements[2] = value_hash_low_shifted

    let (inputs) = alloc()
    let inputs_start = inputs

    let (local keccak_ptr : felt*) = alloc()
    with keccak_ptr:
        keccak_add_uint256s{inputs=inputs}(n_elements=3, elements=elements, bigend=1)
        let (hash) = keccak_bigend(inputs=inputs_start, n_bytes=66)

        return (hash=hash)
    end
end

func hash_struct{syscall_ptr : felt*, range_check_ptr, bitwise_ptr : BitwiseBuiltin*}(
    call_array_len : felt,
    call_array : AccountCallArray*,
    calldata_len : felt,
    calldata : felt*,
    nonce : felt,
) -> (hash : Uint256):
    alloc_locals

    with_attr error_message("Multicall not implemented yet"):
        assert call_array_len = 1
    end

    let (tx_info) = get_tx_info()
    let (this_address) = get_contract_address()

    let (calldata_hash) = hash_calldata(calldata_len, calldata)

    let (local elements : Uint256*) = alloc()

    # type hash
    assert elements[0] = Uint256(TYPE_HASH_LOW, TYPE_HASH_HIGH)

    # account
    let (account_u256) = felt_to_uint256(this_address)
    assert elements[1] = account_u256

    # nonce
    let (nonce_u256) = felt_to_uint256(nonce)
    assert elements[2] = nonce_u256

    # max_fee
    let (max_fee_u256) = felt_to_uint256(tx_info.max_fee)
    assert elements[3] = max_fee_u256

    # to
    let (to_u256) = felt_to_uint256(call_array[0].to)
    assert elements[4] = to_u256

    # selector
    let (selector_u256) = felt_to_uint256(call_array[0].selector)
    assert elements[5] = selector_u256

    # calldata
    assert elements[6] = calldata_hash

    let (inputs) = alloc()
    let inputs_start = inputs

    let (local keccak_ptr : felt*) = alloc()
    with keccak_ptr:
        keccak_add_uint256s{inputs=inputs}(n_elements=7, elements=elements, bigend=1)
        let (hash) = keccak_bigend(inputs=inputs_start, n_bytes=7 * 32)

        return (hash=hash)
    end
end

func hash_calldata{range_check_ptr, bitwise_ptr : BitwiseBuiltin*}(
    calldata_len : felt, calldata : felt*
) -> (hash : Uint256):
    alloc_locals

    let (local elements : Uint256*) = alloc()
    fill_calldata(calldata_len, calldata, 0, elements)

    let (inputs) = alloc()
    let inputs_start = inputs

    let (local keccak_ptr : felt*) = alloc()
    with keccak_ptr:
        keccak_add_uint256s{inputs=inputs}(n_elements=calldata_len, elements=elements, bigend=1)
        let (hash) = keccak_bigend(inputs=inputs_start, n_bytes=calldata_len * 32)

        return (hash=hash)
    end
end

func fill_calldata{range_check_ptr}(
    calldata_len : felt, calldata : felt*, current_index : felt, elements : Uint256*
):
    if calldata_len == current_index:
        return ()
    end

    let (current_value) = felt_to_uint256(calldata[current_index])
    assert elements[current_index] = current_value

    return fill_calldata(
        calldata_len=calldata_len,
        calldata=calldata,
        current_index=current_index + 1,
        elements=elements,
    )
end

@external
func __execute__{
    syscall_ptr : felt*,
    pedersen_ptr : HashBuiltin*,
    range_check_ptr,
    ecdsa_ptr : SignatureBuiltin*,
    bitwise_ptr : BitwiseBuiltin*,
}(
    call_array_len : felt,
    call_array : AccountCallArray*,
    calldata_len : felt,
    calldata : felt*,
    nonce : felt,
) -> (response_len : felt, response : felt*):
    alloc_locals

    with_attr error_message("Multicall not implemented yet"):
        assert call_array_len = 1
    end

    with_attr error_message("Account: invalid EIP-712 signature"):
        let (eip712_sighash) = compute_eip712_sighash(
            call_array_len, call_array, calldata_len, calldata, nonce
        )
        validate_eip712_signature(eip712_sighash)
    end

    return Account._unsafe_execute(call_array_len, call_array, calldata_len, calldata, nonce)
end

func felt_to_uint256{range_check_ptr}(value : felt) -> (res : Uint256):
    # Nothing to check because `felt` can always be converted to `Uint256`
    let (high : felt, low : felt) = split_felt(value)
    return (res=Uint256(low=low, high=high))
end

func validate_eip712_signature{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, bitwise_ptr : BitwiseBuiltin*, range_check_ptr
}(sighash : Uint256):
    alloc_locals

    let (tx_info) = get_tx_info()
    let (__fp__, _) = get_fp_and_pc()

    let (_eth_address) = eth_address.read()

    let sig_v : felt = tx_info.signature[0]
    let sig_r : Uint256 = Uint256(low=tx_info.signature[1], high=tx_info.signature[2])
    let sig_s : Uint256 = Uint256(low=tx_info.signature[3], high=tx_info.signature[4])

    let (local keccak_ptr : felt*) = alloc()
    with keccak_ptr:
        verify_eth_signature_uint256(
            msg_hash=sighash, r=sig_r, s=sig_s, v=sig_v, eth_address=_eth_address
        )
    end

    return ()
end
