%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin, BitwiseBuiltin

from openzeppelin.account.library import Account, AccountCallArray

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

    with_attr error_message("Account: invalid EIP-712 signature"):
        # Not implemented yet
        assert 0 = 1
    end

    return Account._unsafe_execute(call_array_len, call_array, calldata_len, calldata, nonce)
end
