export const excute =function (calls, abis, transactionsDetail) {
    var _a;
    if (abis === void 0) { abis = undefined; }
    if (transactionsDetail === void 0) { transactionsDetail = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var transactions, nonce, _b, _c, maxFee, suggestedMaxFee, signerDetails, signature, calldata;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    transactions = Array.isArray(calls) ? calls : [calls];
                    _b = number_1.toBN;
                    if (!((_a = transactionsDetail.nonce) !== null && _a !== void 0)) return [3 /*break*/, 1];
                    _c = _a;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, this.getNonce()];
                case 2:
                    _c = (_d.sent());
                    _d.label = 3;
                case 3:
                    nonce = _b.apply(void 0, [_c]);
                    maxFee = '0';
                    if (!(transactionsDetail.maxFee || transactionsDetail.maxFee === 0)) return [3 /*break*/, 4];
                    maxFee = transactionsDetail.maxFee;
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, this.estimateFee(transactions, { nonce: nonce })];
                case 5:
                    suggestedMaxFee = (_d.sent()).suggestedMaxFee;
                    maxFee = suggestedMaxFee.toString();
                    _d.label = 6;
                case 6:
                    signerDetails = {
                        walletAddress: this.address,
                        nonce: nonce,
                        maxFee: maxFee,
                        version: (0, number_1.toBN)(hash_1.transactionVersion),
                        chainId: this.chainId,
                    };
                    return [4 /*yield*/, this.signer.signTransaction(transactions, signerDetails, abis)];
                case 7:
                    signature = _d.sent();
                    calldata = (0, transaction_1.fromCallsToExecuteCalldataWithNonce)(transactions, nonce);
                    return [2 /*return*/, this.fetchEndpoint('add_transaction', undefined, {
                            type: 'INVOKE_FUNCTION',
                            contract_address: this.address,
                            entry_point_selector: (0, hash_1.getSelectorFromName)('__execute__'),
                            calldata: calldata,
                            signature: (0, number_1.bigNumberishArrayToDecimalStringArray)(signature),
                            max_fee: (0, number_1.toHex)((0, number_1.toBN)(maxFee)),
                        })];
            }
        });
    });
}